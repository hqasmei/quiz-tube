import { v } from 'convex/values';
import { YoutubeTranscript } from 'youtube-transcript';

import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import { action, mutation, query } from './_generated/server';
import { quizStatusTypes } from './schema';
import { vid } from './util';

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require('@google/generative-ai');

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain',
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  safety_settings: safetySettings,
  generation_config: generationConfig,
});

const QUIZPROMPT = `From the below transcription generate 5 multiple choice questions. Remove non ascii characters in the description`;
const QUIZPROMPTRESPONSEPROMPT = `Create the questions and answers in the following json format. Make sure to validate the JSON`;
const QUIZPROMPTRESPONSEFORMAT = `[{
                              question:
                              options: Array
                              answer: pointing to the option label
                              }]`;

function removeFirstAndLastLine(inputString: string | any) {
  // Split the string into an array of lines using newline character as delimiter
  const lines = inputString.split(/\n/);
  let firstLineRemoved;
  let lastLineRemoved;

  // console.log(`lines[0]: ${lines[0]}`);

  if (lines[0].indexOf('`') > -1) {
    // Remove the first line
    firstLineRemoved = lines.slice(1).join('\n');
    // console.log(`firstLineRemoved are: ${firstLineRemoved}`);
  }

  // console.log(`Last line: ${lines[lines.length - 1]}`);
  if (lines[lines.length - 1].indexOf('`') > -1) {
    // Remove the last line
    if (firstLineRemoved) {
      lastLineRemoved = firstLineRemoved.split(/\n/).slice(0, -1).join('\n');
    } else {
      lastLineRemoved = lines.splice(0, -1).join('\n');
    }
  }

  if (lastLineRemoved && lastLineRemoved.length < 0) {
    lastLineRemoved = [];
  }

  if (!lastLineRemoved) {
    return inputString;
  }

  return lastLineRemoved;
}

export async function generateQuestions(instructionText: string) {
  const prompt = `${QUIZPROMPT} \n
    ${instructionText} \n
    ${QUIZPROMPTRESPONSEPROMPT} \n
    ${QUIZPROMPTRESPONSEFORMAT}`;

  // Inspired from https://github.com/google-gemini/generative-ai-js/blob/main/samples/node/simple-text.js#L28
  const result = await model.generateContent(prompt);
  const response = result.response;
  const generatedQuizQuestions = response.text();
  // console.log('Prompt response:', generatedQuizQuestions);
  // console.log(
  //   'After clean up: ',
  //   removeFirstAndLastLine(generatedQuizQuestions),
  // );

  // The response from the API is in the format
  // ```json
  // [{....}]
  // ```
  // Clean the first and last line to extract the JSON
  const cleanedGeneratedQuizQuestions = removeFirstAndLastLine(
    generatedQuizQuestions,
  );
  // console.log(cleanedGeneratedQuizQuestions);
  return JSON.parse(cleanedGeneratedQuizQuestions);
}

export const getQuiz = query({
  args: {
    videoId: v.string(),
  },
  handler: async (ctx, args) => {
    const quiz = await ctx.db
      .query('quizzes')
      .withIndex('by_videoId', (q) => q.eq('videoId', args.videoId))
      .first();
    return quiz;
  },
});

export const addQuiz = mutation({
  args: {
    videoId: v.string(),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        answer: v.string(),
      }),
    ),
    createdBy: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.insert('quizzes', {
      videoId: args.videoId,
      questions: args.questions,
      createdBy: args.createdBy,
      status: args.status as 'processing' | 'ready',
    });

    return quiz;
  },
});

export const updateQuiz = mutation({
  args: {
    quizId: vid('quizzes'),
    videoId: v.string(),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        answer: v.string(),
      }),
    ),
    createdBy: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.quizId, {
      videoId: args.videoId,
      questions: args.questions,
      createdBy: args.createdBy,
      status: args.status as 'processing' | 'ready',
    });
  },
});

export const generateQuiz = action({
  args: {
    videoId: vid('videos'),
  },
  handler: async (ctx, args) => {
    // Get the video id
    const video = await ctx.runQuery(api.videos.getVideo, {
      videoId: args.videoId,
    });

    // Create a new quiz
    const quiz = await ctx.runMutation(api.quizzes.addQuiz, {
      videoId: args.videoId,
      questions: [],
      createdBy: video.userId,
      status: 'processing',
    });

    // Get the transcript
    const transcript = YoutubeTranscript.fetchTranscript(video.youtubeId, {
      lang: 'en',
    });

    // Clean the transcript
    let completeTranscript = '';
    (await transcript).map((t) => (completeTranscript += t.text));
    const videoCleanTranscript = completeTranscript.replace(
      /[^\x00-\x7F]/g,
      '',
    );

    // Generate the quiz questions
    const generatedQuestions = await generateQuestions(videoCleanTranscript);

    // Put it in the quizzes table
    await ctx.runMutation(api.quizzes.updateQuiz, {
      quizId: quiz as Id<'quizzes'>,
      videoId: video._id as Id<'videos'>,
      questions: generatedQuestions,
      createdBy: video.userId,
      status: 'ready',
    });
  },
});

export const deleteQuiz = mutation({
  args: {
    videoId: vid('videos'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.videoId);
  },
});

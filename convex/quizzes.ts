import { v } from 'convex/values';
import { YoutubeTranscript } from 'youtube-transcript';

import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import { action, mutation, query } from './_generated/server';
import { QUIZ_STATUS_TYPES } from './schema';
import { vid } from './util';

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require('@google/generative-ai');

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const QUIZ_GENERATION_RETRY_COUNT_LIMIT = process.env.QUIZ_GENERATION_RETRY_COUNT_LIMIT ? parseInt(process.env.QUIZ_GENERATION_RETRY_COUNT_LIMIT, 10) : 3;

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

type QuizQuestion = {
  question: string;
  options: Array<string>;
  answer: string;
};

function removeFirstAndLastLine(inputString: string | any) {
  // Split the string into an array of lines using newline character as delimiter
  let lines = inputString.split(/\n/);

  // For the input string starting with "```json"
  if (lines[0].indexOf('```json') > -1) {
    // Remove the first line
    lines = lines.slice(1);
  }

  console.debug(`After first line removal`, lines);

  if (lines[lines.length - 1].indexOf('```') > -1) {
    // Remove the last line
    lines = lines.slice(0, -1);
  }

  console.debug(`After last line removal`, lines);

  // In case when inputString is equal to
  // ```json
  // ```
  if (lines.length <= 0) {
    return [];
  }

  return lines.join('\n');
}

/** Quiz questions and answers are generated in two formats
 Format 1:
 Multiple choice options:
 A. Choice 1
 B. Choice 2
 C. Choice 3
 D. Choice 4
 
 Answer: B
 
 Format 2:
 Multiple choice options:
 Choice 1
 Choice 2
 Choice 3
 Choice 4
 
 Answer Choice 2
 
 Normalized Format
 Format 2
 WHY?
 Makes it easy to evaluate the submission by doing string equality check with answer
*/  
function normalizeQuizQuestions(quizQuestions: Array<QuizQuestion>): Array<QuizQuestion> {
  // RegEx to identify the response of format 1
  const format1OptionRegEx = /^[a-zA-Z0-9][\.)\]]/; // Supports options listed as "A.", "a.", "1." OR "A)" OR "A]"
  const format1AnswerRegEx = /^[a-zA-Z0-9]/; // Supports options listed as "A", "a", "1"

  // YouTube video samples that generate format 1 question set
  // Option Format: "A)" https://youtu.be/1598tCTdPrg

  quizQuestions.forEach((questionObj: QuizQuestion) => {
    const questionOptions = questionObj.options;
    const questionAnswer = questionObj.answer;
    
    // For format 2 response, no processing is needed
    let normalizedQuestionAnswer = questionAnswer;
    let normalizedQuestionOptions = questionOptions;

    questionOptions.forEach((option: string, index: number) => {
      if (format1OptionRegEx.test(option)) {
        const optionLabel = option[0];
        option = option.substring(2).trimStart();
        normalizedQuestionOptions[index] = option;
        
        if (format1AnswerRegEx.test(questionAnswer) &&
          questionAnswer == optionLabel
        ) {
          normalizedQuestionAnswer = option;
        }
      }
    });

    questionObj['options'] = normalizedQuestionOptions;
    questionObj['answer'] = normalizedQuestionAnswer;
  });

  return quizQuestions;
}

function processApiResponse(apiResponse: string | any) {
  try {
    console.debug(`API Response: ${apiResponse}`);
    
    // Step 1: Extract the parsable JSON from the response
    const jsonStrFromResponse = removeFirstAndLastLine(apiResponse);
    console.debug(`API JSON Response: ${jsonStrFromResponse}`);
    const questionsJson = JSON.parse(jsonStrFromResponse);

    // Step 2: Normalize the questions and answers
    const normalizedQuestions = normalizeQuizQuestions(questionsJson);
    console.debug(`Normalized quiz questions: ${JSON.stringify(normalizedQuestions)}`);
    
    return normalizedQuestions;
  } catch (error) {
    console.error(`API Response failed JSON parsing: ${apiResponse}`);
    throw error;
  }
}

export async function generateQuestions(instructionText: string, attemptCount = 1) {
  const prompt = `${QUIZPROMPT} \n
    ${instructionText} \n
    ${QUIZPROMPTRESPONSEPROMPT} \n
    ${QUIZPROMPTRESPONSEFORMAT}`;

  try {
    // Inspired from https://github.com/google-gemini/generative-ai-js/blob/main/samples/node/simple-text.js#L28
    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedQuizQuestions = response.text();

    return processApiResponse(generatedQuizQuestions);
  } catch (error) {
    // Retry generating quiz
    if (attemptCount < QUIZ_GENERATION_RETRY_COUNT_LIMIT) {
      return await generateQuestions(instructionText, attemptCount + 1);
    } else {
      throw new Error('All attempts to generate the quiz with Gemini failed.');
    }
  }
  
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
      status: QUIZ_STATUS_TYPES.PROCESSING,
    });

    try {
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
        status: QUIZ_STATUS_TYPES.READY,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed in generating quiz. Error message: ${error.message}`);
      } else {
        console.error(`Failed in generating quiz. Unknown error: ${error}`);
      }
      await ctx.runMutation(api.quizzes.updateQuiz, {
        quizId: quiz as Id<'quizzes'>,
        videoId: video._id as Id<'videos'>,
        questions: [],
        createdBy: video.userId,
        status: QUIZ_STATUS_TYPES.FAILED,
      });

      // [TODO][Kanika consult Hosna]: Surface this error to the front end for handling
    }
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

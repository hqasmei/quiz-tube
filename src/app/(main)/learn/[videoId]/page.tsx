'use client';

import React, { useState } from 'react';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { YouTubeEmbed } from '@next/third-parties/google';
import { useQuery } from 'convex/react';

import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';

interface Answers {
  [key: number]: string;
}

export default function LearnPage({ params }: { params: { videoId: string } }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const videoId = params.videoId;
  const getVideo = useQuery(api.videos.getVideo, {
    videoId: videoId as Id<'videos'>,
  });
  const getQuiz = useQuery(api.quizzes.getQuiz, {
    videoId: videoId as Id<'videos'>,
  });

  function handleAnswer(questionIndex: number, option: string) {
    setAnswers((prev) => {
      const updatedAnswers = { ...prev, [questionIndex]: option };

      // Update score if this is the first time the question is being answered or if the answer is changed
      if (
        !prev[questionIndex] ||
        (prev[questionIndex] && option !== prev[questionIndex])
      ) {
        const correctAnswer = getQuiz?.questions[questionIndex].answer;
        const adjustment = option === correctAnswer ? 1 : -1;
        setScore((prevScore) => prevScore + adjustment);
      }

      // Check if all questions have been answered
      const allAnswered =
        Object.keys(updatedAnswers).length === getQuiz?.questions.length;
      setQuizComplete(allAnswered);

      return updatedAnswers;
    });
  }
  return (
    <>
      {/* Mobile */}
      <div className="p-4 flex flex-col lg:hidden">
        <div className="mt-10 flex flex-col space-y-4 items-center justify-center min-w-xl">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${getVideo?.youtubeId}`}
            className="rounded-xl w-full h-full"
          />
          <span className="text-xl font-semibold">{getVideo?.title}</span>
        </div>

        <div className="rounded-lg pt-4 bg-white">
          <Tabs defaultValue="questions" className="w-full flex-1 px-4">
            <TabsList className="w-full">
              <TabsTrigger value="questions" className="w-full">
                Questions
              </TabsTrigger>
              <TabsTrigger value="submissions" className="w-full">
                Submissions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="questions">
              <div className="mx-auto pb-10">
                {getQuiz?.questions?.map((question: any, index: number) => (
                  <div
                    key={index}
                    className="my-4 p-5  rounded-lg bg-neutral-50"
                  >
                    <h3 className="font-semibold">
                      {index + 1}. {question.question}
                    </h3>
                    <div className="mt-2">
                      {question.options.map((option: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(index, option)}
                          className={`block p-2 my-2 text-left w-full border rounded hover:bg-gray-100 ${answers[index] === option ? 'bg-blue-100' : ''}`}
                        >
                          {option}
                          {answers[index] === option && (
                            <span
                              className={`font-bold ${option === question.answer ? 'text-green-500' : 'text-red-500'}`}
                            >
                              {option === question.answer
                                ? ' Correct'
                                : ' Incorrect'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {quizComplete && (
                  <div className="text-center p-5">
                    <h2 className="text-lg font-semibold">
                      Quiz Completed! Here are your results:
                    </h2>
                    <p>
                      You got {score} out of {getQuiz?.questions.length}{' '}
                      correct!
                    </p>
                    {getQuiz?.questions.map((question: any, index: number) => (
                      <div
                        key={index}
                        className={`text-${answers[index] === question.answer ? 'green' : 'red'}-500`}
                      >
                        Question {index + 1}:{' '}
                        {answers[index] === question.answer
                          ? 'Correct'
                          : 'Incorrect'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="submissions"></TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Desktop */}
      <div className="w-full hidden lg:flex">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel className="min-w-xl">
            <div className="mt-10 flex flex-col space-y-4 items-center justify-center min-w-xl">
              <iframe
                width="620"
                height="315"
                src={`https://www.youtube.com/embed/${getVideo?.youtubeId}`}
                className="rounded-xl w-[60%] h-full"
              />
              <span className="text-xl font-semibold">{getVideo?.title}</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <ScrollArea className="h-[calc(93vh-10px)] w-full rounded-md ">
              <div className="m-4 rounded-lg pt-4 bg-white">
                <Tabs defaultValue="questions" className="w-full   flex-1 px-4">
                  <TabsList className="w-full">
                    <TabsTrigger value="questions" className="w-full">
                      Questions
                    </TabsTrigger>
                    <TabsTrigger value="submissions" className="w-full">
                      Submissions
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="questions">
                    <div className="mx-auto pb-10">
                      {getQuiz?.questions?.map(
                        (question: any, index: number) => (
                          <div
                            key={index}
                            className="my-4 p-5  rounded-lg bg-neutral-50"
                          >
                            <h3 className="font-semibold">
                              {index + 1}. {question.question}
                            </h3>
                            <div className="mt-2">
                              {question.options.map(
                                (option: string, idx: number) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleAnswer(index, option)}
                                    className={`block p-2 my-2 text-left w-full border rounded hover:bg-gray-100 ${answers[index] === option ? 'bg-blue-100' : ''}`}
                                  >
                                    {option}
                                    {answers[index] === option && (
                                      <span
                                        className={`font-bold ${option === question.answer ? 'text-green-500' : 'text-red-500'}`}
                                      >
                                        {option === question.answer
                                          ? ' Correct'
                                          : ' Incorrect'}
                                      </span>
                                    )}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                        ),
                      )}
                      {quizComplete && (
                        <div className="text-center p-5">
                          <h2 className="text-lg font-semibold">
                            Quiz Completed! Here are your results:
                          </h2>
                          <p>
                            You got {score} out of {getQuiz?.questions.length}{' '}
                            correct!
                          </p>
                          {getQuiz?.questions.map(
                            (question: any, index: number) => (
                              <div
                                key={index}
                                className={`text-${answers[index] === question.answer ? 'green' : 'red'}-500`}
                              >
                                Question {index + 1}:{' '}
                                {answers[index] === question.answer
                                  ? 'Correct'
                                  : 'Incorrect'}
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="submissions"></TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}

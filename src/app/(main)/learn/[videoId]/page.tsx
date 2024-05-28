'use client';

import React, { useState } from 'react';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
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
        <div className="flex flex-col space-y-4  min-w-xl">
          <div className="w-full aspect-video">
            <iframe
              width="100"
              height="100"
              src={`https://www.youtube.com/embed/${getVideo?.youtubeId}`}
              className="rounded-xl w-full h-full"
            />
          </div>
          <span className="text-xl font-semibold">{getVideo?.title}</span>
        </div>

        <div className="rounded-lg mt-10 pt-6 bg-white">
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
              {getQuiz?.status === 'ready' ? (
                <div className="mx-auto pb-10 flex flex-col space-y-4">
                  {getQuiz?.questions?.map((question: any, index: number) => (
                    <div
                      key={index}
                      className="bg-accent rounded-lg p-4 md:p-6"
                    >
                      <h2 className="text-xl font-semibold mb-2 dark:text-white">
                        {index + 1}. {question.question}
                      </h2>
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        {question.options.map((option: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(index, option)}
                            className={cn(
                              `rounded-lg px-4 py-2 text-left transition-colors`,
                              answers[index] === option
                                ? option === question.answer
                                  ? 'bg-green-300 dark:bg-green-700 '
                                  : 'bg-red-300 dark:bg-red-700 '
                                : 'bg-white dark:bg-neutral-700',
                            )}
                          >
                            {option}
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
              ) : (
                <div className="mx-auto pb-10 flex flex-col space-y-4">
                  <Skeleton className="h-48 w-full rounded-md " />
                  <Skeleton className="h-48 w-full rounded-md " />
                  <Skeleton className="h-48 w-full rounded-md " />
                  <Skeleton className="h-48 w-full rounded-md " />
                  <Skeleton className="h-48 w-full rounded-md " />
                </div>
              )}
            </TabsContent>
            <TabsContent value="submissions">
              <Skeleton className="h-48 w-full rounded-md " />
              <Skeleton className="h-48 w-full rounded-md " />
              <Skeleton className="h-48 w-full rounded-md " />
              <Skeleton className="h-48 w-full rounded-md " />
              <Skeleton className="h-48 w-full rounded-md " />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Desktop */}
      <div className="w-full hidden lg:flex">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel className="w-full min-w-[400px]">
            <div className="flex flex-col space-y-4  flex-1 h-full p-4">
              <div className="w-full aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${getVideo?.youtubeId}`}
                  className="rounded-xl w-full h-full"
                />
              </div>

              <span className="text-xl font-semibold">{getVideo?.title}</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel className="w-full min-w-[600px]">
            <ScrollArea className="h-[calc(93vh-10px)] w-full rounded-md ">
              <div className="m-4 rounded-lg pt-4 bg-background">
                <Tabs defaultValue="questions" className="w-full   flex-1 px-4">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="questions" className="w-full">
                      Questions
                    </TabsTrigger>
                    <TabsTrigger value="submissions" className="w-full">
                      Submissions
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="questions">
                    {getQuiz?.status === 'ready' ? (
                      <div className="mx-auto pb-10 flex flex-col space-y-4">
                        {getQuiz?.questions?.map(
                          (question: any, index: number) => (
                            <div
                              key={index}
                              className="bg-neutral-200/70 dark:bg-accent  rounded-lg p-4 md:p-6"
                            >
                              <h2 className="text-xl font-semibold mb-2 dark:text-white">
                                {index + 1}. {question.question}
                              </h2>
                              <div className="grid grid-cols-2 gap-3 md:gap-4">
                                {question.options.map(
                                  (option: string, idx: number) => (
                                    <button
                                      key={idx}
                                      onClick={() =>
                                        handleAnswer(index, option)
                                      }
                                      className={cn(
                                        `rounded-lg px-4 py-2 text-left transition-colors`,
                                        answers[index] === option
                                          ? option === question.answer
                                            ? 'bg-green-300 dark:bg-green-700 '
                                            : 'bg-red-300 dark:bg-red-700 '
                                          : 'bg-white dark:bg-neutral-700',
                                      )}
                                    >
                                      {option}
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
                    ) : (
                      <div className="mx-auto pb-10 flex flex-col space-y-4">
                        <Skeleton className="h-48 w-full rounded-md " />
                        <Skeleton className="h-48 w-full rounded-md " />
                        <Skeleton className="h-48 w-full rounded-md " />
                        <Skeleton className="h-48 w-full rounded-md " />
                        <Skeleton className="h-48 w-full rounded-md " />
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="submissions">
                    <Skeleton className="h-48 w-full rounded-md " />
                    <Skeleton className="h-48 w-full rounded-md " />
                    <Skeleton className="h-48 w-full rounded-md " />
                    <Skeleton className="h-48 w-full rounded-md " />
                    <Skeleton className="h-48 w-full rounded-md " />
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}

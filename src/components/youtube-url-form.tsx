'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useSession } from '@/lib/client-auth';
import { useUser } from '@clerk/clerk-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'convex/react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from './ui/button';

const formSchema = z.object({
  youtubeUrl: z.string().min(2, {
    message: 'Need a YouTube URL',
  }),
});

export default function YoutubeURLForm() {
  const user = useUser();
  const session = useSession();
  const router = useRouter();
  const userId = session?.session?.user?.id;

  const addVideo = useAction(api.videos.addVideo);
  const createQuiz = useAction(api.quizzes.createQuiz);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      youtubeUrl: 'https://www.youtube.com/watch?v=tZVZQLyCDfo',
    },
  });

  const isLoading = form.formState.isSubmitting;
  const isValid = form.formState.isValid;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (user.isSignedIn) {
        // Add Video Info to DB
        const videoId = await addVideo({
          youtubeUrl: values.youtubeUrl,
          userId: userId as Id<'users'>,
        });
        // Create Quiz
        createQuiz({
          videoId: videoId as Id<'videos'>,
        });
        // Redirect to Quiz
        router.push(`/learn/${videoId} `);
      } else {
        router.push('/sign-in');
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex flex-col space-y-10 w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-row space-x-2 items-start w-full"
        >
          <FormField
            control={form.control}
            name="youtubeUrl"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="relative h-10 w-full rounded-md">
                    <Input
                      placeholder="https://www.youtube.com/watch?v=tZVZQLyCDfo"
                      {...field}
                      className="h-12 text-md w-full rounded-lg"
                    />
                    <Button
                      type="submit"
                      className="w-fit whitespace-nowrap group mt-0.5 flex flex-row items-center gap-1.5 absolute right-1.5 top-[22px] transform -translate-y-1/2   z-10 cursor-pointer"
                      disabled={isLoading || !isValid}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <div className="flex flex-row items-center space-x-1">
                          <span>Generate Quiz</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 duration-200" />
                        </div>
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}

'use client';

import React from 'react';

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
  const router = useRouter();

  const addVideo = useAction(api.videos.addVideo);
  const generateQuiz = useAction(api.quizzes.generateQuiz);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      youtubeUrl: '',
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
        });
        // Generate Quiz
        generateQuiz({
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
                  <Input
                    placeholder="https://www.youtube.com/watch?v=tZVZQLyCDfo"
                    {...field}
                    className="w-full overflow-hidden truncate"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="whitespace-nowrap group w-fit h-10"
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
        </form>
      </Form>
    </div>
  );
}

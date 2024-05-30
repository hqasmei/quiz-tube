'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { headerIconStyle } from '@/styles/global';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MessageSquareMore } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  feedback: z.string().min(2).max(50),
});

export default function Feedback() {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      feedback: '',
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetch('https://projectplannerai.com/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '',
          feedback: values.feedback,
          projectId: process.env.NEXT_PUBLIC_PROJECT_PLANNER_ID,
        }),
      });
      toast.success('Your feedback has been submitted');
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Failed to send feedback:', error);
    }
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <MessageSquareMore className={headerIconStyle} />
      </PopoverTrigger>
      <PopoverContent sideOffset={10} className="mr-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Your feedback..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex flex-row space-x-2 items-center">
                  <span>Sending...</span>
                  <Loader2 className="animate-spin" />
                </div>
              ) : (
                'Send'
              )}
            </Button>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
}

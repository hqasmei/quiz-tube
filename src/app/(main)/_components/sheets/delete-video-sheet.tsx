'use client';

import { Dispatch, ReactNode, SetStateAction, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';

const formSchema = z.object({
  videoItemId: z.string(),
});

function DeleteVideoForm({
  videoItem,
  setShowSheet,
}: {
  videoItem?: Doc<'videos'>;
  setShowSheet: Dispatch<SetStateAction<boolean>>;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      videoItemId: videoItem?._id,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const deleteVideo = useMutation(api.videos.deleteVideo);

  const onSubmit = async () => {
    try {
      deleteVideo({
        videoId: videoItem?._id as Id<'videos'>,
      });
      setShowSheet(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="w-full flex justify-center space-x-6">
          <Button
            size="lg"
            variant="outline"
            disabled={isLoading}
            className="w-full"
            type="button"
            onClick={() => setShowSheet(false)}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting
              </>
            ) : (
              <span>Delete</span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function DeleteVideoSheet({
  videoItem,
  children,
  className,
}: {
  videoItem?: Doc<'videos'>;
  children: ReactNode;
  className?: string;
}) {
  const [showSheet, setShowSheet] = useState(false);

  return (
    <Sheet open={showSheet} onOpenChange={setShowSheet}>
      <SheetTrigger className={className}>{children}</SheetTrigger>
      <SheetContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="flex flex-row justify-between">
          <div className="flex flex-col space-y-2">
            <h1>Delete</h1>
          </div>
        </div>

        <DeleteVideoForm videoItem={videoItem} setShowSheet={setShowSheet} />
      </SheetContent>
    </Sheet>
  );
}

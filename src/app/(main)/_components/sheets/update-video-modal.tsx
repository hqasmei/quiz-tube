'use client';

import { Dispatch, SetStateAction, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { useMediaQuery } from '@/hooks/use-media-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { Loader2, SquarePen } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  title: z.string(),
});

function UpdateVideoForm({
  videoItem,
  setOpen,
}: {
  videoItem?: Doc<'videos'>;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: videoItem?.title,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const updateVideo = useMutation(api.videos.updateVideo);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      updateVideo({
        videoId: videoItem?._id as Id<'videos'>,
        title: values.title,
      });
      setOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="w-full flex flex-col justify-center space-y-4">
          <FormField
            name="title"
            control={form.control}
            render={({ field }: { field: any }) => (
              <FormItem className="col-span-2 md:col-span-1">
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row w-full justify-between space-x-4">
            <Button
              size="lg"
              variant="outline"
              disabled={isLoading}
              className="w-full"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              type="submit"
              disabled={isLoading}
              className="w-full "
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                <span>Save</span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export function UpdateVideoModal({
  videoItem,
  showUpdateVideoModal,
  setShowUpdateVideoModal,
}: {
  videoItem?: Doc<'videos'>;
  showUpdateVideoModal: boolean;
  setShowUpdateVideoModal: Dispatch<SetStateAction<boolean>>;
}) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog
        open={showUpdateVideoModal}
        onOpenChange={setShowUpdateVideoModal}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>
              Make changes to your video title here.
            </DialogDescription>
          </DialogHeader>
          <UpdateVideoForm
            videoItem={videoItem}
            setOpen={setShowUpdateVideoModal}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={showUpdateVideoModal} onOpenChange={setShowUpdateVideoModal}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DialogTitle>Edit Video</DialogTitle>
          <DialogDescription>
            Make changes to your video title here.
          </DialogDescription>
        </DrawerHeader>
        <UpdateVideoForm
          videoItem={videoItem}
          setOpen={setShowUpdateVideoModal}
        />
      </DrawerContent>
    </Drawer>
  );
}

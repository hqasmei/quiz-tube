'use client';

import { Dispatch, ReactNode, SetStateAction, useState } from 'react';

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
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Form } from '@/components/ui/form';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import { useMediaQuery } from '@/hooks/use-media-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'convex/react';
import { Loader2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  videoItemId: z.string(),
});

function DeleteVideoForm({
  videoItem,
  setOpen,
}: {
  videoItem?: Doc<'videos'>;
  setOpen: Dispatch<SetStateAction<boolean>>;
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
      setOpen(false);
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
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            type="submit"
            disabled={isLoading}
            variant="destructive"
            className="w-full"
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

export function DeleteVideoModal({
  videoItem,
  showDeleteVideoModal,
  setShowDeleteVideoModal,
}: {
  videoItem?: Doc<'videos'>;
  showDeleteVideoModal: boolean;
  setShowDeleteVideoModal: Dispatch<SetStateAction<boolean>>;
}) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Dialog
        open={showDeleteVideoModal}
        onOpenChange={setShowDeleteVideoModal}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription>
              Once you delete a video, you will no longer be able to access it.
            </DialogDescription>
          </DialogHeader>
          <DeleteVideoForm
            videoItem={videoItem}
            setOpen={setShowDeleteVideoModal}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={showDeleteVideoModal} onOpenChange={setShowDeleteVideoModal}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Delete Video</DrawerTitle>
          <DialogDescription>
            Once you delete a video, you will no longer be able to access it.
          </DialogDescription>
        </DrawerHeader>
        <DeleteVideoForm
          videoItem={videoItem}
          setOpen={setShowDeleteVideoModal}
        />
      </DrawerContent>
    </Drawer>
  );
}

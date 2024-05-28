'use client';

import React, { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import YoutubeURLForm from '@/components/youtube-url-form';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useSession } from '@/lib/client-auth';
import { useQuery } from 'convex/react';
import { EllipsisVertical, SquarePen, Trash2 } from 'lucide-react';

import { DeleteVideoModal } from '../../_components/sheets/delete-video-modal';
import { UpdateVideoModal } from '../../_components/sheets/update-video-modal';

export function VideoContent() {
  const { session } = useSession();
  const router = useRouter();
  const userId = session?.user.id as Id<'users'>;
  const getVideos = useQuery(api.videos.getVideos, { userId: userId });
  const [showDeleteVideoModal, setShowDeleteVideoModal] = useState(false);
  const [showUpdateVideoModal, setShowUpdateVideoModal] = useState(false);
  if (!getVideos) return <VideoContentSkeleton />;

  return (
    <div>
      {getVideos && getVideos?.length > 0 ? (
        <div>
          <div className="flex items-center justify-end">
            <span>{getVideos?.length} items</span>
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {getVideos?.map((video, idx) => {
              const thumbnailUrl = video?.thumbnailUrl;
              const videoId = video?._id;

              return (
                <div key={idx}>
                  <Card className="hover:shadow-lg duration-200 cursor-pointer relative">
                    <Link href={`/learn/${videoId}`}>
                      <div className="relative h-full w-full p-4">
                        <Image
                          src={thumbnailUrl}
                          alt="Quiz Icon"
                          layout="responsive"
                          width={500}
                          height={300}
                          objectFit="contain"
                          className="object-contain rounded-lg"
                        />
                        <div className="flex flex-row items-center mt-4">
                          <span className="font-semibold line-clamp-1 text-sm mr-8">
                            {video?.title}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className='absolute right-2.5 bottom-2.5 flex'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                          >
                            <EllipsisVertical className="text-sm h-5 w-5" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-[160px] z-50 "
                        >
                          <DropdownMenuItem>
                            <button
                              onClick={(e) => {
                                e.preventDefault;
                                e.stopPropagation;
                                setShowUpdateVideoModal(true);
                              }}
                              className="w-full justify-start flex flex-row space-x-2 items-center rounded"
                            >
                              <SquarePen size={16} />
                              <span className="text-md">Edit</span>
                            </button>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <button
                              onClick={(e) => {
                                e.preventDefault;
                                e.stopPropagation;
                                setShowDeleteVideoModal(true);
                              }}
                              className="w-full justify-start flex flex-row space-x-2 items-center rounded"
                            >
                              <Trash2 size={16} className="stroke-red-500" />
                              <span className="text-md text-red-500">
                                Delete
                              </span>
                            </button>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DeleteVideoModal
                        showDeleteVideoModal={showDeleteVideoModal}
                        setShowDeleteVideoModal={setShowDeleteVideoModal}
                        videoItem={video}
                      />
                      <UpdateVideoModal
                        showUpdateVideoModal={showUpdateVideoModal}
                        setShowUpdateVideoModal={setShowUpdateVideoModal}
                        videoItem={video}
                      />
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-end">
            <span>0 items</span>
          </div>
          <Separator />
          <div className="flex items-center justify-center pt-10">
            <span className="font-semibold">
              No videos have been added yet.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function VideoSkeleton() {
  return (
    <Card>
      <div className="p-4">
        <div className="mb-4">
          <Skeleton className="h-48 w-full" />
        </div>

        <div className="flex justify-between">
          <Skeleton className="h-5 w-[60%]" />
          <Skeleton className="h-5 w-[10%]" />
        </div>
      </div>
    </Card>
  );
}

export function VideoContentSkeleton() {
  return (
    <div>
      <div>
        <div className="flex items-center justify-end mb-1">
          <Skeleton className="h-[20px] w-[70px] rounded-md" />
        </div>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          <VideoSkeleton />
        </div>
      </div>
    </div>
  );
}

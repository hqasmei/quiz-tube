import YoutubeURLForm from '@/components/youtube-url-form';

import { VideoContent } from './_components/video-content';

export default function DashboardPage() {
  return (
    <div>
      {/* Top Section */}
      <section className="flex-1 h-full flex flex-col space-y-4 px-4 md:container">
        <div className="flex flex-col space-y-6 mt-24 mb-10 px-4 items-center text-center justify-center">
          <span className="font-medium text-lg md:text-3xl text-center">
            Enter a YouTube Video you would like to generate a quiz from
          </span>
          <div className="w-full max-w-2xl flex flex-row space-x-2 items-center justify-center">
            <YoutubeURLForm />
          </div>
        </div>

        {/* Video Content */}
        <section>
          <VideoContent />
        </section>
      </section>
    </div>
  );
}

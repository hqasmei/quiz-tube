import ConditionalSignin from '@/components/conditional-signin';
import { Goal } from 'lucide-react';

export default function CTA() {
  return (
    <section id="cta" className="w-full">
      <div className="py-14">
        <div className="container flex w-full flex-col items-center justify-center p-4 ">
          <div className="relative flex w-full max-w-[1000px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border p-10 py-14 bg-neutral-50 dark:bg-neutral-800">
            <div className="z-10 mx-auto size-24 rounded-[2rem] border bg-white/10 p-3 shadow-2xl backdrop-blur-md dark:bg-black/10 lg:size-18">
              <Goal className="mx-auto size-16 text-black dark:text-white lg:size-18" />
            </div>
            <div className="z-10 mt-4 flex flex-col items-center text-center text-black dark:text-white space-y-4">
              <h1 className="text-3xl font-bold lg:text-4xl">
                Start Actively Learning Today!
              </h1>
              <p className="mt-2">Learn from the YouTube videos you watch</p>
              <ConditionalSignin />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent to-white to-70% dark:to-black" />
          </div>
        </div>
      </div>
    </section>
  );
}

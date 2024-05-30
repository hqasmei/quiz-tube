'use client';

import { SendEventOnLoad } from '@/hooks/use-send-event-on-load';

import CTA from './_sections/cta';
import Hero from './_sections/hero';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between w-full">
      <SendEventOnLoad eventKey="user hit landing page" />
      <Hero />
      <CTA />
    </main>
  );
}

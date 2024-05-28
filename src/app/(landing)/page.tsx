'use client';

import CTA from './_sections/cta';
import Hero from './_sections/hero';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between w-full">
      <Hero />
      <CTA />
    </main>
  );
}

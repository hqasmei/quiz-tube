import React from 'react';

import { ThemeToggle } from '@/components/theme-toggle';

export default function Footer() {
  return (
    <footer className="relative py-6 md:py-0">
      <div
        className="absolute top-0 h-px w-full"
        style={{
          background:
            'radial-gradient(50% 100% at 50% 100%,rgba(255,255,255,.32) 0%,rgba(255,255,255,0) 100%)',
        }}
      ></div>
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Copyright @ 2024 QuizTube. All Rights Reserved.
        </p>
        {/* <ThemeToggle /> */}
      </div>
    </footer>
  );
}

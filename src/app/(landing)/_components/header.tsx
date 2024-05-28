'use client';

import React from 'react';

import ConditionalSignin from '@/components/conditional-signin';
import { MainNav } from './main-nav';
import { cn } from '@/lib/utils';

export default function Header() {
  return (
    <header
      className={cn(
        'supports-backdrop-blur:bg-background/90 sticky top-0 z-40 w-full  bg-background/40 backdrop-blur-lg',
      )}
    >
      <div className="container flex h-16 items-center">
        <MainNav />
        <div className="flex flex-1 items-center  gap-2 justify-end">
          <ConditionalSignin />
        </div>
      </div>
      <hr className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-200/30 to-neutral-200/0" />
    </header>
  );
}

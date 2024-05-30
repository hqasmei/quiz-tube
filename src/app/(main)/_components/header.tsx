'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ThemeToggle } from '@/components/theme-toggle';
import { SignedIn, UserButton } from '@clerk/nextjs';

import Feedback from './feedback';
import { MainNav } from './main-nav';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full border-b">
      <div className="px-6 flex h-16 items-center">
        <div className="flex flex-row items-center space-x-4">
          <MainNav />
          <Link
            href="/dashboard"
            className={`${pathname === '/dashboard' ? 'font-medium' : ''}`}
          >
            Dashboard
          </Link>
        </div>

        <div className="flex flex-1 items-center flex-row space-x-6 justify-end">
          <Feedback />
          <ThemeToggle isDropDown={true} />
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
      <hr className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-200/30 to-neutral-200/0" />
    </header>
  );
}

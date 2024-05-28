'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { MainNav } from '@/components/main-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { useSession } from '@/lib/client-auth';
import { cn } from '@/lib/utils';
import { SignedIn, UserButton } from '@clerk/nextjs';

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="w-full border-b">
      <div className="container flex h-16 items-center">
        <MainNav />
        <div className="flex flex-1 items-center flex-row space-x-6 justify-end">
          <Link
            href="/dashboard"
            className={`${pathname === '/dashboard' ? 'font-medium' : ''}`}
          >
            Dashboard
          </Link>
          <SignedIn>
            <UserButton />
          </SignedIn>
          {/* <ThemeToggle isDropDown={true} /> */}
        </div>
      </div>
      <hr className="m-0 h-px w-full border-none bg-gradient-to-r from-neutral-200/0 via-neutral-200/30 to-neutral-200/0" />
    </header>
  );
}

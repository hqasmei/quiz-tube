'use client';

import React from 'react';

import Link from 'next/link';

import { useSession } from '@/lib/client-auth';
import { SignInButton } from '@clerk/nextjs';

import { Button } from './ui/button';

export default function ConditionalSignin() {
  const session = useSession();
  return (
    <>
      {session.isLoggedIn ? (
        <Button size="sm" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      ) : (
        <Button asChild>
          <SignInButton>Get started</SignInButton>
        </Button>
      )}
    </>
  );
}

'use client';

import Link from 'next/link';

import { siteConfig } from '@/config/site';

export function MainNav() {
  const [firstPart, secondPart] = siteConfig.name.split(/(?<=^Quiz)/);

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="font-bold inline-block text-xl">
          <span>{firstPart}</span>
          <span className="text-red-500">{secondPart}</span>
        </span>
      </Link>
    </div>
  );
}

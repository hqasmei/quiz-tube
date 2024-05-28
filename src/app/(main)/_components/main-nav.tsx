'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Icons } from '@/components/icons';
import { siteConfig } from '@/config/site';

export function MainNav() {
  const pathname = usePathname();
  const [firstPart, secondPart] = siteConfig.name.split(/(?<=^Quiz)/);

  return (
    <div className="mr-4 flex">
      <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
        <span className="font-bold inline-block text-xl">
          <span>{firstPart}</span>
          <span className="text-red-500">{secondPart}</span>
        </span>
      </Link>
    </div>
  );
}

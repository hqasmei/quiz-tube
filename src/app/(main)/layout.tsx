import React from 'react';

import Header from './_components/header';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col h-screen'>
      <Header />
      <main className="flex-1  bg-neutral-50">{children}</main>
    </div>
  );
}

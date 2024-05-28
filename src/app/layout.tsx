import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';

import '@/styles/globals.css';

import { ContextProvider } from '@/components/context-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'QuizTube | Generate quizzes from YouTube videos',
    template: '%s | QuizTube',
  },
  description: 'Generate quizzes from YouTube videos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(montserrat.className)}>
        <ContextProvider>{children}</ContextProvider>
      </body>
    </html>
  );
}

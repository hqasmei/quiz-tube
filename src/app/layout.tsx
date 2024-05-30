import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';

import '@/styles/globals.css';

import { ContextProvider } from '@/components/context-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { toast, Toaster } from 'sonner';

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
    <html lang="en" suppressHydrationWarning>
      <body className={cn(montserrat.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ContextProvider>{children}</ContextProvider>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}

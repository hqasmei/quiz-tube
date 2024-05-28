import { useState } from 'react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');
    const isValidYouTubeUrl = (url: string) => {
      const pattern = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
      return pattern.test(url);
    };
    const handleBlur = () => {
      if (!isValidYouTubeUrl(url)) {
        setError('Please enter a valid YouTube URL.');
      } else {
        setError('');
      }
    };
    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(e.target.value);
    };
    return (
      <>
        <input
          type={type}
          onChange={handleOnChange}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          onBlur={handleBlur}
          ref={ref}
          {...props}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </>
    );
  },
);
Input.displayName = 'Input';

export { Input };

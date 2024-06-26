'use client';

import React, { useRef } from 'react';

import YoutubeURLForm from '@/components/youtube-url-form';
import { motion, useInView } from 'framer-motion';

export default function Hero() {
  const fadeInRef = useRef(null);
  const fadeInInView = useInView(fadeInRef, {
    once: true,
  });

  const fadeUpVariants = {
    initial: {
      opacity: 0,
      y: 24,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <section id="hero">
      <div className="relative h-full overflow-hidden">
        <div className="container z-10 flex flex-col">
          <div className="mt-20 grid grid-cols-1">
            <div className="flex flex-col items-center gap-6 pb-8 text-center">
              <motion.h1
                ref={fadeInRef}
                animate={fadeInInView ? 'animate' : 'initial'}
                variants={fadeUpVariants}
                initial={false}
                transition={{
                  duration: 0.6,
                  delay: 0.1,
                  ease: [0.21, 0.47, 0.32, 0.98],
                  type: 'spring',
                }}
                className="text-balance bg-gradient-to-br from-black from-30% to-black/60 bg-clip-text py-6 text-5xl font-semibold leading-none tracking-tighter text-transparent dark:from-white dark:to-white/40 sm:text-6xl md:text-7xl lg:text-7xl"
              >
                Transform YouTube Videos into Interactive Quizzes in Seconds
              </motion.h1>

              <motion.p
                ref={fadeInRef}
                className="max-w-[64rem] text-balance text-lg tracking-tight text-gray-500 md:text-xl"
                animate={fadeInInView ? 'animate' : 'initial'}
                variants={fadeUpVariants}
                initial={false}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                  ease: [0.21, 0.47, 0.32, 0.98],
                  type: 'spring',
                }}
              >
                Turn passive video watching into active learning by solidifying
                your knowledge with engaging, interactive quizzes
              </motion.p>

              <motion.div
                ref={fadeInRef}
                animate={fadeInInView ? 'animate' : 'initial'}
                variants={fadeUpVariants}
                className="flex flex-col gap-4 lg:flex-row w-full items-center max-w-2xl justify-center"
                initial={false}
                transition={{
                  duration: 0.6,
                  delay: 0.3,
                  ease: [0.21, 0.47, 0.32, 0.98],
                  type: 'spring',
                }}
              >
                <YoutubeURLForm />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

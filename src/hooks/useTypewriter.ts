// src/hooks/useTypewriter.ts
// Reveals text one character at a time from a growing source string.
// Works with streaming: as `text` grows, new characters are typed incrementally.

import { useState, useEffect } from 'react';

export function useTypewriter(text: string, speed = 18): string {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    // Nothing to type if already caught up or text is empty
    if (text.length <= displayed.length) return;

    const id = setInterval(() => {
      setDisplayed((prev) => {
        if (prev.length >= text.length) {
          clearInterval(id);
          return prev;
        }
        return text.slice(0, prev.length + 1);
      });
    }, speed);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  return displayed;
}

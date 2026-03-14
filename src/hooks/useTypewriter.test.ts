import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTypewriter } from './useTypewriter';

describe('useTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty string when input text is empty', () => {
    const { result } = renderHook(() => useTypewriter(''));
    expect(result.current).toBe('');
  });

  it('initially returns empty string before any time advances', () => {
    const { result } = renderHook(() => useTypewriter('Hello'));
    expect(result.current).toBe('');
  });

  it('reveals full "Hello" after advancing 5 character intervals (5 * 18ms)', async () => {
    const { result } = renderHook(() => useTypewriter('Hello'));

    // Advance timer by 5 intervals of 18ms to reveal all 5 characters
    await act(async () => {
      vi.advanceTimersByTime(5 * 18);
    });

    expect(result.current).toBe('Hello');
  });

  it('reveals characters incrementally — partial text after partial advance', async () => {
    const { result } = renderHook(() => useTypewriter('Hello'));

    await act(async () => {
      vi.advanceTimersByTime(3 * 18); // advance 3 character intervals
    });

    expect(result.current).toBe('Hel');
  });

  it('when text grows from "He" to "Hello", new characters appear after timers advance', async () => {
    const { result, rerender } = renderHook(
      ({ text }) => useTypewriter(text),
      { initialProps: { text: 'He' } }
    );

    // Reveal "He" first
    await act(async () => {
      vi.advanceTimersByTime(2 * 18);
    });
    expect(result.current).toBe('He');

    // Now the source text grows — simulating a streaming chunk arriving
    rerender({ text: 'Hello' });

    // Advance by 3 more intervals to reveal "llo"
    await act(async () => {
      vi.advanceTimersByTime(3 * 18);
    });

    expect(result.current).toBe('Hello');
  });

  it('does not reveal more characters than the source text', async () => {
    const { result } = renderHook(() => useTypewriter('Hi'));

    await act(async () => {
      vi.advanceTimersByTime(100 * 18); // way more than enough time
    });

    expect(result.current).toBe('Hi');
  });

  it('accepts custom speed parameter', async () => {
    const speed = 50;
    const { result } = renderHook(() => useTypewriter('Hi', speed));

    await act(async () => {
      vi.advanceTimersByTime(2 * speed);
    });

    expect(result.current).toBe('Hi');
  });
});

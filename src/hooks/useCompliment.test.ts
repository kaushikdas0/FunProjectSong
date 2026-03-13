import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase/app
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
}));

// Mock firebase/remote-config
vi.mock('firebase/remote-config', () => ({
  getRemoteConfig: vi.fn(() => ({
    settings: { minimumFetchIntervalMillis: 0 },
    defaultConfig: {},
  })),
  fetchAndActivate: vi.fn(() => Promise.resolve(true)),
  getValue: vi.fn(() => ({ asString: () => 'gemini-2.5-flash' })),
}));

// Mock generateContent function reference — replaceable per test
const mockGenerateContent = vi.fn();

// Mock firebase/ai
vi.mock('firebase/ai', () => ({
  getAI: vi.fn(() => ({})),
  getGenerativeModel: vi.fn(() => ({
    generateContent: mockGenerateContent,
  })),
  GoogleAIBackend: class {
    constructor() {}
  },
}));

// Import hook AFTER mocks are set up
import { useCompliment } from './useCompliment';

describe('useCompliment hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: successful generateContent
    mockGenerateContent.mockResolvedValue({
      response: { text: () => 'mocked compliment' },
    });
  });

  it('initial state is { status: "idle" }', () => {
    const { result } = renderHook(() => useCompliment());
    expect(result.current.state).toEqual({ status: 'idle' });
  });

  it('calling generate("Alice") transitions to generating then result', async () => {
    const { result } = renderHook(() => useCompliment());

    await act(async () => {
      await result.current.generate('Alice');
    });

    expect(result.current.state).toEqual({
      status: 'result',
      name: 'Alice',
      compliment: 'mocked compliment',
    });
  });

  it('calling generate() when already generating is a no-op (debounce)', async () => {
    const { result } = renderHook(() => useCompliment());

    // Create a slow generate that we can control
    let resolveGenerate!: (val: unknown) => void;
    mockGenerateContent.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveGenerate = resolve;
      })
    );

    // Start first generate without awaiting — Alice is now in-flight
    let firstGeneratePromise: Promise<void>;
    act(() => {
      firstGeneratePromise = result.current.generate('Alice');
    });

    // Bob's generate fires while Alice is still in-flight — isFlyingRef blocks it
    // Bob's call returns immediately (no-op), doesn't change state, doesn't call API
    act(() => {
      result.current.generate('Bob');
    });

    // Now resolve Alice's in-flight request
    await act(async () => {
      resolveGenerate({ response: { text: () => 'Alice compliment' } });
      await firstGeneratePromise!;
    });

    // Final state must be Alice's result — Bob was blocked by debounce
    expect(result.current.state).toEqual({
      status: 'result',
      name: 'Alice',
      compliment: 'Alice compliment',
    });

    // generateContent called exactly once (Alice only; Bob was never executed)
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('when generateContent throws, state transitions to { status: "error" }', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('API failure'));

    const { result } = renderHook(() => useCompliment());

    await act(async () => {
      await result.current.generate('Alice');
    });

    expect(result.current.state).toEqual({ status: 'error' });
  });

  it('calling generate("Bob") from error state transitions back through generating to result', async () => {
    // First call: error
    mockGenerateContent.mockRejectedValueOnce(new Error('API failure'));

    const { result } = renderHook(() => useCompliment());

    await act(async () => {
      await result.current.generate('Alice');
    });

    expect(result.current.state.status).toBe('error');

    // Second call from error state: success
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => 'Bob compliment' },
    });

    await act(async () => {
      await result.current.generate('Bob');
    });

    expect(result.current.state).toEqual({
      status: 'result',
      name: 'Bob',
      compliment: 'Bob compliment',
    });
  });

  it('calling generate("Carol") from result state (regenerate) produces new result', async () => {
    // First call: success for Alice
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => 'Alice compliment' },
    });

    const { result } = renderHook(() => useCompliment());

    await act(async () => {
      await result.current.generate('Alice');
    });

    expect(result.current.state).toEqual({
      status: 'result',
      name: 'Alice',
      compliment: 'Alice compliment',
    });

    // Regenerate: call again with Carol
    mockGenerateContent.mockResolvedValueOnce({
      response: { text: () => 'Carol compliment' },
    });

    await act(async () => {
      await result.current.generate('Carol');
    });

    expect(result.current.state).toEqual({
      status: 'result',
      name: 'Carol',
      compliment: 'Carol compliment',
    });
  });
});

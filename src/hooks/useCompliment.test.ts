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

// Mock generateContentStream function reference — replaceable per test
const mockGenerateContentStream = vi.fn();

// Mock firebase/ai
vi.mock('firebase/ai', () => ({
  getAI: vi.fn(() => ({})),
  getGenerativeModel: vi.fn(() => ({
    generateContentStream: mockGenerateContentStream,
  })),
  GoogleAIBackend: class {
    constructor() {}
  },
}));

// Helper: async generator to simulate streaming chunks
async function* fakeStream(chunks: string[]) {
  for (const chunk of chunks) {
    yield { text: () => chunk };
  }
}

// Helper: async generator that yields one chunk then throws
async function* fakeStreamWithError(chunk: string, error: Error) {
  yield { text: () => chunk };
  throw error;
}

// Import hook AFTER mocks are set up
import { useCompliment } from './useCompliment';

describe('useCompliment hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: successful generateContentStream with single chunk to preserve existing test behavior
    mockGenerateContentStream.mockResolvedValue({
      stream: fakeStream(['mocked compliment']),
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

    // Create a slow stream that we can control
    let resolveStream!: (val: AsyncIterable<{ text: () => string }>) => void;
    const controlledStream = new Promise<AsyncIterable<{ text: () => string }>>((resolve) => {
      resolveStream = resolve;
    });

    async function* slowStream() {
      const chunks = await controlledStream;
      for await (const chunk of chunks) {
        yield chunk;
      }
    }

    mockGenerateContentStream.mockResolvedValueOnce({ stream: slowStream() });

    // Start first generate without awaiting — Alice is now in-flight
    let firstGeneratePromise: Promise<void>;
    act(() => {
      firstGeneratePromise = result.current.generate('Alice');
    });

    // Bob's generate fires while Alice is still in-flight — isFlyingRef blocks it
    act(() => {
      result.current.generate('Bob');
    });

    // Now resolve Alice's in-flight stream
    await act(async () => {
      resolveStream(fakeStream(['Alice compliment']));
      await firstGeneratePromise!;
    });

    // Final state must be Alice's result — Bob was blocked by debounce
    expect(result.current.state).toEqual({
      status: 'result',
      name: 'Alice',
      compliment: 'Alice compliment',
    });

    // generateContentStream called exactly once (Alice only; Bob was never executed)
    expect(mockGenerateContentStream).toHaveBeenCalledTimes(1);
  });

  it('when generateContentStream throws, state transitions to { status: "error" }', async () => {
    mockGenerateContentStream.mockRejectedValueOnce(new Error('API failure'));

    const { result } = renderHook(() => useCompliment());

    await act(async () => {
      await result.current.generate('Alice');
    });

    expect(result.current.state).toEqual({ status: 'error' });
  });

  it('calling generate("Bob") from error state transitions back through generating to result', async () => {
    // First call: error
    mockGenerateContentStream.mockRejectedValueOnce(new Error('API failure'));

    const { result } = renderHook(() => useCompliment());

    await act(async () => {
      await result.current.generate('Alice');
    });

    expect(result.current.state.status).toBe('error');

    // Second call from error state: success
    mockGenerateContentStream.mockResolvedValueOnce({
      stream: fakeStream(['Bob compliment']),
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
    mockGenerateContentStream.mockResolvedValueOnce({
      stream: fakeStream(['Alice compliment']),
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
    mockGenerateContentStream.mockResolvedValueOnce({
      stream: fakeStream(['Carol compliment']),
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

  it('generate transitions through streaming to result with accumulated chunks', async () => {
    mockGenerateContentStream.mockResolvedValueOnce({
      stream: fakeStream(['Hello ', 'world!']),
    });

    const { result } = renderHook(() => useCompliment());

    await act(async () => {
      await result.current.generate('Alice');
    });

    // Final state should have full accumulated text
    expect(result.current.state).toEqual({
      status: 'result',
      name: 'Alice',
      compliment: 'Hello world!',
    });
  });

  it('if stream throws mid-way, state transitions to error', async () => {
    mockGenerateContentStream.mockResolvedValueOnce({
      stream: fakeStreamWithError('partial text', new Error('stream error')),
    });

    const { result } = renderHook(() => useCompliment());

    await act(async () => {
      await result.current.generate('Alice');
    });

    expect(result.current.state).toEqual({ status: 'error' });
  });
});

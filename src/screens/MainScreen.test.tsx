import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock useCompliment hook — we control state and generate function
const mockGenerate = vi.fn();

vi.mock('../hooks/useCompliment', () => ({
  useCompliment: vi.fn(() => ({
    state: { status: 'idle' },
    generate: mockGenerate,
  })),
}));

// Mock downloadCard module — we verify it gets called with card DOM node
vi.mock('../lib/downloadCard', () => ({
  downloadCard: vi.fn(() => Promise.resolve()),
}));

import { useCompliment } from '../hooks/useCompliment';
import { downloadCard } from '../lib/downloadCard';
import MainScreen from './MainScreen';

const mockUseCompliment = vi.mocked(useCompliment);
const mockDownloadCard = vi.mocked(downloadCard);

describe('MainScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: idle state
    mockUseCompliment.mockReturnValue({
      state: { status: 'idle' },
      generate: mockGenerate,
    });
  });

  it('renders input with auto-focus and playful placeholder text', () => {
    render(<MemoryRouter><MainScreen /></MemoryRouter>);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
    // Placeholder should be something playful (non-empty)
    expect(input).toHaveAttribute('placeholder');
    const placeholder = input.getAttribute('placeholder') ?? '';
    expect(placeholder.length).toBeGreaterThan(0);
  });

  it('"Boost Me" button is disabled when input has fewer than 3 characters', () => {
    render(<MemoryRouter><MainScreen /></MemoryRouter>);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Al' } });
    const button = screen.getByRole('button', { name: /boost me/i });
    expect(button).toBeDisabled();
  });

  it('"Boost Me" button is enabled when input has 3+ characters', () => {
    render(<MemoryRouter><MainScreen /></MemoryRouter>);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Ali' } });
    const button = screen.getByRole('button', { name: /boost me/i });
    expect(button).not.toBeDisabled();
  });

  it('during generating state, button shows "Boosting..." and is disabled', () => {
    mockUseCompliment.mockReturnValue({
      state: { status: 'generating' },
      generate: mockGenerate,
    });
    render(<MemoryRouter><MainScreen /></MemoryRouter>);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Ali' } });
    const button = screen.getByRole('button', { name: /boosting/i });
    expect(button).toBeDisabled();
  });

  it('after result state, button shows "Boost Again"', () => {
    mockUseCompliment.mockReturnValue({
      state: { status: 'result', name: 'Ali', compliment: 'You are magnificent!' },
      generate: mockGenerate,
    });
    render(<MemoryRouter><MainScreen /></MemoryRouter>);
    const button = screen.getByRole('button', { name: /boost again/i });
    expect(button).toBeInTheDocument();
  });

  it('error state renders playful error message and "Try Again" button (no raw error text)', () => {
    mockUseCompliment.mockReturnValue({
      state: { status: 'error' },
      generate: mockGenerate,
    });
    render(<MemoryRouter><MainScreen /></MemoryRouter>);
    // Should show a friendly message — not "Error" or raw error codes
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    expect(tryAgainButton).toBeInTheDocument();
    // Should NOT show raw error text
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/500/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/stack trace/i)).not.toBeInTheDocument();
  });

  it('ComplimentCard renders with name and compliment when in result state', () => {
    mockUseCompliment.mockReturnValue({
      state: { status: 'result', name: 'Ali', compliment: 'You are the universe\'s finest creation!' },
      generate: mockGenerate,
    });
    render(<MemoryRouter><MainScreen /></MemoryRouter>);
    // Card should show the name and compliment
    expect(screen.getByText('Ali')).toBeInTheDocument();
    expect(screen.getByText("You are the universe's finest creation!")).toBeInTheDocument();
  });

  it('during streaming state, card is visible with partial compliment', () => {
    mockUseCompliment.mockReturnValue({
      state: { status: 'streaming', name: 'Ali', compliment: 'You are' },
      generate: mockGenerate,
    });
    render(<MemoryRouter><MainScreen /></MemoryRouter>);
    // Card name should be visible
    expect(screen.getByText('Ali')).toBeInTheDocument();
  });

  it('during streaming state, download button is NOT visible', () => {
    mockUseCompliment.mockReturnValue({
      state: { status: 'streaming', name: 'Ali', compliment: 'You are' },
      generate: mockGenerate,
    });
    render(<MemoryRouter><MainScreen /></MemoryRouter>);
    expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
  });

  it('during result state, download button IS visible', () => {
    mockUseCompliment.mockReturnValue({
      state: { status: 'result', name: 'Ali', compliment: 'You are magnificent!' },
      generate: mockGenerate,
    });
    render(<MemoryRouter><MainScreen /></MemoryRouter>);
    expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
  });

  it('tapping download button calls downloadCard', async () => {
    mockUseCompliment.mockReturnValue({
      state: { status: 'result', name: 'Ali', compliment: 'You are magnificent!' },
      generate: mockGenerate,
    });
    render(<MemoryRouter><MainScreen /></MemoryRouter>);
    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);
    expect(mockDownloadCard).toHaveBeenCalledTimes(1);
  });
});

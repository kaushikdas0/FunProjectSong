import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock useCompliment hook — we control state and generate function
const mockGenerate = vi.fn();

vi.mock('../hooks/useCompliment', () => ({
  useCompliment: vi.fn(() => ({
    state: { status: 'idle' },
    generate: mockGenerate,
  })),
}));

import { useCompliment } from '../hooks/useCompliment';
import MainScreen from './MainScreen';

const mockUseCompliment = vi.mocked(useCompliment);

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
    render(<MainScreen />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
    // Placeholder should be something playful (non-empty)
    expect(input).toHaveAttribute('placeholder');
    const placeholder = input.getAttribute('placeholder') ?? '';
    expect(placeholder.length).toBeGreaterThan(0);
  });

  it('"Boost Me" button is disabled when input has fewer than 3 characters', () => {
    render(<MainScreen />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Al' } });
    const button = screen.getByRole('button', { name: /boost me/i });
    expect(button).toBeDisabled();
  });

  it('"Boost Me" button is enabled when input has 3+ characters', () => {
    render(<MainScreen />);
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
    render(<MainScreen />);
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
    render(<MainScreen />);
    const button = screen.getByRole('button', { name: /boost again/i });
    expect(button).toBeInTheDocument();
  });

  it('error state renders playful error message and "Try Again" button (no raw error text)', () => {
    mockUseCompliment.mockReturnValue({
      state: { status: 'error' },
      generate: mockGenerate,
    });
    render(<MainScreen />);
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
    render(<MainScreen />);
    // Card should show the name and compliment
    expect(screen.getByText('Ali')).toBeInTheDocument();
    expect(screen.getByText("You are the universe's finest creation!")).toBeInTheDocument();
  });
});

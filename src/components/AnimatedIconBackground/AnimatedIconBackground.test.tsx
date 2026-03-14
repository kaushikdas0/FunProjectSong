import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AnimatedIconBackground } from './AnimatedIconBackground';

describe('AnimatedIconBackground', () => {
  it('renders without crashing', () => {
    const { container } = render(<AnimatedIconBackground />);
    expect(container.firstChild).toBeTruthy();
  });

  it('has aria-hidden="true" on wrapper', () => {
    const { container } = render(<AnimatedIconBackground />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders multiple decorative icon spans', () => {
    const { container } = render(<AnimatedIconBackground />);
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBeGreaterThanOrEqual(10);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock html-to-image BEFORE importing the module under test
vi.mock('html-to-image', () => ({
  toPng: vi.fn(),
  getFontEmbedCSS: vi.fn(),
}));

import { toPng, getFontEmbedCSS } from 'html-to-image';
import { downloadCard } from './downloadCard';

const mockToPng = toPng as ReturnType<typeof vi.fn>;
const mockGetFontEmbedCSS = getFontEmbedCSS as ReturnType<typeof vi.fn>;

describe('downloadCard', () => {
  let mockAnchor: {
    download: string;
    href: string;
    click: ReturnType<typeof vi.fn>;
  };

  // Capture original before any spying — stored once at module scope to avoid recursion
  const realCreateElement = Document.prototype.createElement.bind(document);

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock toPng to return a fake data URL
    mockToPng.mockResolvedValue('data:image/png;base64,fakedata');

    // Mock getFontEmbedCSS to return fake CSS
    mockGetFontEmbedCSS.mockResolvedValue('/* fake font css */');

    // Mock document.fonts.ready
    Object.defineProperty(document, 'fonts', {
      value: { ready: Promise.resolve() },
      configurable: true,
    });

    // Mock document.createElement to intercept anchor creation
    mockAnchor = { download: '', href: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchor as unknown as HTMLElement;
      return realCreateElement(tag);
    });
  });

  it('calls document.fonts.ready before calling toPng', async () => {
    const callOrder: string[] = [];
    let fontsReadyResolve!: () => void;
    const fontsReadyPromise = new Promise<void>((resolve) => {
      fontsReadyResolve = resolve;
    });
    Object.defineProperty(document, 'fonts', {
      value: {
        ready: fontsReadyPromise.then(() => {
          callOrder.push('fonts.ready');
        }),
      },
      configurable: true,
    });
    mockToPng.mockImplementationOnce(async () => {
      callOrder.push('toPng');
      return 'data:image/png;base64,fakedata';
    });
    mockGetFontEmbedCSS.mockImplementationOnce(async () => {
      callOrder.push('getFontEmbedCSS');
      return '/* css */';
    });

    const node = document.createElement('div');
    const downloadPromise = downloadCard(node);
    fontsReadyResolve();
    await downloadPromise;

    expect(callOrder[0]).toBe('fonts.ready');
  });

  it('passes pixelRatio >= 2 to toPng', async () => {
    const node = document.createElement('div');
    await downloadCard(node);

    const callOptions = mockToPng.mock.calls[0][1];
    expect(callOptions.pixelRatio).toBeGreaterThanOrEqual(2);
  });

  it('calls getFontEmbedCSS and passes fontEmbedCSS to toPng', async () => {
    const node = document.createElement('div');
    await downloadCard(node);

    expect(mockGetFontEmbedCSS).toHaveBeenCalledWith(node);
    const callOptions = mockToPng.mock.calls[0][1];
    expect(callOptions.fontEmbedCSS).toBe('/* fake font css */');
  });

  it('creates an anchor, sets .download and .href, calls .click()', async () => {
    const node = document.createElement('div');
    await downloadCard(node, 'test-card.png');

    expect(mockAnchor.download).toBe('test-card.png');
    expect(mockAnchor.href).toBe('data:image/png;base64,fakedata');
    expect(mockAnchor.click).toHaveBeenCalledTimes(1);
  });

  it('uses default filename "my-boost.png" when no filename provided', async () => {
    const node = document.createElement('div');
    await downloadCard(node);

    expect(mockAnchor.download).toBe('my-boost.png');
  });

  it('if getFontEmbedCSS throws, toPng is still called and anchor.click fires', async () => {
    mockGetFontEmbedCSS.mockRejectedValueOnce(new Error('CORS error'));

    const node = document.createElement('div');
    await downloadCard(node);

    // toPng should still be called (without fontEmbedCSS option)
    expect(mockToPng).toHaveBeenCalledTimes(1);
    const callOptions = mockToPng.mock.calls[0][1];
    expect(callOptions.fontEmbedCSS).toBeUndefined();

    // anchor.click should still fire
    expect(mockAnchor.click).toHaveBeenCalledTimes(1);
  });
});

// src/lib/downloadCard.ts
// Captures a DOM node as a retina-quality PNG with embedded Caveat font,
// then triggers a browser download via anchor click.

import { toPng, getFontEmbedCSS } from 'html-to-image';

export async function downloadCard(node: HTMLElement, filename = 'my-boost.png') {
  // 1. Wait for all fonts registered in the document to finish loading
  await document.fonts.ready;

  // 2. Embed font CSS — getFontEmbedCSS fetches and base64-encodes the woff2 file
  //    If font fetch fails (localhost CORS edge case), log and continue without embed
  let fontEmbedCSS: string | undefined;
  try {
    fontEmbedCSS = await getFontEmbedCSS(node);
  } catch (err) {
    console.warn('downloadCard: font embed failed, PNG may use fallback font', err);
  }

  // 3. Render at >=2x for retina sharpness
  const pixelRatio = Math.max(2, window.devicePixelRatio ?? 2);

  const dataUrl = await toPng(node, {
    pixelRatio,
    ...(fontEmbedCSS ? { fontEmbedCSS } : {}),
  });

  // 4. Trigger download via anchor click
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

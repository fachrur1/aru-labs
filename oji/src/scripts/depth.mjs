export function sceneProgress(top, height, viewport, scroll, hero = false) {
  const start = hero ? top : top - viewport;
  const distance = hero ? height : height + viewport;
  return Math.min(1, Math.max(0, (scroll - start) / Math.max(1, distance)));
}

export function layerTransform(progress, x, y, rotation, scale, amplitude) {
  const p = progress * amplitude;
  return `translate3d(${p * x}px, ${p * y}px, 0) rotate(${p * rotation}deg) scale(${1 + p * scale})`;
}

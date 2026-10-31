import { sceneProgress, layerTransform } from './depth.mjs';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(pointer: fine)');
const controls = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]'));
let paused = false;
try { paused = localStorage.getItem('oji-motion') === 'off'; } catch { /* Storage is optional. */ }
const scenes = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]')).map(element => ({
  element, top: 0, height: 1,
  layers: Array.from(element.querySelectorAll<SVGElement | HTMLElement>('[data-layer]')),
}));
let frame = 0;
let pointerX = 0;
let pointerY = 0;

function measure() {
  for (const scene of scenes) {
    scene.top = scene.element.getBoundingClientRect().top + scrollY;
    scene.height = scene.element.offsetHeight;
  }
  schedule();
}
function render() {
  frame = 0;
  const off = paused || reduced.matches;
  document.documentElement.dataset.motion = off ? 'off' : 'on';
  for (const button of controls) {
    button.textContent = off ? 'Motion off' : 'Motion on';
    button.setAttribute('aria-pressed', String(!off));
    button.disabled = reduced.matches;
    button.title = reduced.matches ? 'Motion disabled by your system preference' : 'Toggle scene motion';
  }
  const mobile = innerWidth < 768;
  const amplitude = off ? 0 : mobile ? .24 : innerWidth <= 1024 ? .55 : 1;
  for (const scene of scenes) {
    const progress = sceneProgress(scene.top, scene.height, innerHeight, scrollY, scene.element.dataset.hero === 'true');
    for (const layer of scene.layers) {
      const active = !mobile || layer.hasAttribute('data-mobile');
      layer.style.transform = layerTransform(progress, Number(layer.dataset.x || 0), Number(layer.dataset.y || 0), Number(layer.dataset.rotate || 0), Number(layer.dataset.scale || 0), active ? amplitude : 0);
    }
    scene.element.style.setProperty('--pointer-x', `${off || mobile || !fine.matches ? 0 : pointerX}px`);
    scene.element.style.setProperty('--pointer-y', `${off || mobile || !fine.matches ? 0 : pointerY}px`);
  }
  document.documentElement.style.setProperty('--scroll-progress', String(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
}
function schedule() { if (!frame) frame = requestAnimationFrame(render); }
for (const button of controls) button.addEventListener('click', () => {
  paused = !paused;
  try { localStorage.setItem('oji-motion', paused ? 'off' : 'on'); } catch { /* Motion works without storage. */ }
  schedule();
});
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', measure, { passive: true });
addEventListener('pointermove', event => {
  if (!fine.matches || innerWidth < 768 || reduced.matches || paused) return;
  pointerX = (event.clientX / innerWidth - .5) * 20;
  pointerY = (event.clientY / innerHeight - .5) * 12;
  schedule();
}, { passive: true });
reduced.addEventListener('change', schedule);
new ResizeObserver(measure).observe(document.body);
measure();

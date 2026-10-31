import test from 'node:test';
import assert from 'node:assert/strict';
import { sceneProgress, layerTransform } from '../src/scripts/depth.mjs';

test('hero scroll progress starts at zero and clamps to the scene', () => {
  assert.equal(sceneProgress(0, 1000, 800, 0, true), 0);
  assert.equal(sceneProgress(0, 1000, 800, 500, true), .5);
  assert.equal(sceneProgress(0, 1000, 800, 2000, true), 1);
  assert.equal(sceneProgress(0, 1000, 800, -100, true), 0);
});

test('lower scenes advance only from actual viewport travel', () => {
  assert.equal(sceneProgress(1200, 400, 800, 0), 0);
  assert.equal(sceneProgress(1200, 400, 800, 1000), .5);
  assert.equal(sceneProgress(1200, 400, 800, 2000), 1);
});

test('depth produces independent multidirectional translation and scale', () => {
  assert.equal(layerTransform(.5, 100, -80, 12, .04, 1), 'translate3d(50px, -40px, 0) rotate(6deg) scale(1.02)');
  assert.equal(layerTransform(1, 100, -80, 12, .04, 0), 'translate3d(0px, 0px, 0) rotate(0deg) scale(1)');
});

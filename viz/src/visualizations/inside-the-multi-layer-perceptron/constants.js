export const X_DATA = [
  [3.0, 4.0, 2.0],
  [2.0, 3.5, 3.0],
  [4.0, 4.5, 1.0],
  [1.5, 3.0, 2.0],
  [5.0, 3.8, 3.0],
  [8.0, 7.5, 0.0],
  [10.0, 8.0, 1.0],
  [7.0, 7.0, 0.0],
  [12.0, 9.0, 0.0],
  [6.0, 7.2, 1.0],
];

export const Y_DATA = [[0], [0], [0], [0], [0], [1], [1], [1], [1], [1]];

export const LEARNING_RATES = [0.01, 0.05, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

// SVG network layout constants
export const SVG_W = 400;
export const SVG_H = 400;
export const IN_NODES = [
  { id: 'i1', x: 50, y: 100, label: 'X1' },
  { id: 'i2', x: 50, y: 200, label: 'X2' },
  { id: 'i3', x: 50, y: 300, label: 'X3' },
];
export const HID_NODES = [
  { id: 'h1', x: 200, y: 50, label: 'H1' },
  { id: 'h2', x: 200, y: 150, label: 'H2' },
  { id: 'h3', x: 200, y: 250, label: 'H3' },
  { id: 'h4', x: 200, y: 350, label: 'H4' },
];
export const OUT_NODES = [{ id: 'o1', x: 350, y: 200, label: 'Out' }];

export const NEXT_PHASE_MAP = {
  idle: 'forward',
  forward: 'loss',
  loss: 'backward',
  backward: 'update',
  update: 'forward',
};

// zScale is used purely for visual Three.js rendering to prevent the surface becoming too tall.
// All mathematical steps (X, Y, derivatives) use the true unscaled values.
export const functions = [
  {
    id: 'bowl',
    name: 'Convex Bowl (Simple Minimum)',
    f: (x, y) => x * x + y * y,
    dx: (x, _y) => 2 * x,
    dy: (_x, y) => 2 * y,
    fLatex: 'f(x,y) = x^2 + y^2',
    dxLatex: '\\tfrac{\\partial f}{\\partial x} = 2x',
    dyLatex: '\\tfrac{\\partial f}{\\partial y} = 2y',
    domain: [-3, 3],
    zScale: 0.3,
  },
  {
    id: 'saddle',
    name: 'Saddle Point (Min in X, Max in Y)',
    f: (x, y) => x * x - y * y,
    dx: (x, _y) => 2 * x,
    dy: (_x, y) => -2 * y,
    fLatex: 'f(x,y) = x^2 - y^2',
    dxLatex: '\\tfrac{\\partial f}{\\partial x} = 2x',
    dyLatex: '\\tfrac{\\partial f}{\\partial y} = -2y',
    domain: [-3, 3],
    zScale: 0.3,
  },
  {
    id: 'himmelblau',
    name: 'Himmelblau (4 Local Minima)',
    f: (x, y) => Math.pow(x * x + y - 11, 2) + Math.pow(x + y * y - 7, 2),
    dx: (x, y) => 4 * x * (x * x + y - 11) + 2 * (x + y * y - 7),
    dy: (x, y) => 2 * (x * x + y - 11) + 4 * y * (x + y * y - 7),
    fLatex: 'f(x,y) = (x^2+y-11)^2 + (x+y^2-7)^2',
    dxLatex: '\\tfrac{\\partial f}{\\partial x} = 4x(x^2+y-11)+2(x+y^2-7)',
    dyLatex: '\\tfrac{\\partial f}{\\partial y} = 2(x^2+y-11)+4y(x+y^2-7)',
    domain: [-5, 5],
    zScale: 0.015,
  },
  {
    id: 'wave',
    name: 'Sinusoidal Valley',
    f: (x, y) => 3 * Math.sin(x) + 3 * Math.cos(y) + 0.2 * (x * x + y * y),
    dx: (x, _y) => 3 * Math.cos(x) + 0.4 * x,
    dy: (_x, y) => -3 * Math.sin(y) + 0.4 * y,
    fLatex: 'f(x,y) = 3\\sin(x)+3\\cos(y)+0.2(x^2+y^2)',
    dxLatex: '\\tfrac{\\partial f}{\\partial x} = 3\\cos(x)+0.4x',
    dyLatex: '\\tfrac{\\partial f}{\\partial y} = -3\\sin(y)+0.4y',
    domain: [-5, 5],
    zScale: 0.5,
  },
];

export const learningRates = [0.001, 0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1.0];

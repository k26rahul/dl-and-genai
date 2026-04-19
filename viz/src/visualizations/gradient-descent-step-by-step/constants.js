export const functions = [
  {
    id: 'convex',
    name: 'Convex Parabola (Simple Bowl)',
    f: x => x * x,
    df: x => 2 * x,
    formulaLatex: 'x^2',
    derivativeLatex: '2x',
    domain: [-3, 3],
    range: [-1, 10],
  },
  {
    id: 'concave',
    name: 'Concave Parabola (Hill)',
    f: x => -x * x + 6,
    df: x => -2 * x,
    formulaLatex: '-x^2 + 6',
    derivativeLatex: '-2x',
    domain: [-3, 3],
    range: [-4, 7],
  },
  {
    id: 'polynomial',
    name: 'Polynomial (Local & Global Minima)',
    f: x => 0.25 * Math.pow(x, 4) + 0.3 * Math.pow(x, 3) - 1.5 * Math.pow(x, 2) + 2,
    df: x => 1.0 * Math.pow(x, 3) + 0.9 * Math.pow(x, 2) - 3.0 * x,
    formulaLatex: '0.25x^4 + 0.3x^3 - 1.5x^2 + 2',
    derivativeLatex: 'x^3 + 0.9x^2 - 3x',
    domain: [-4, 3],
    range: [-3, 8],
  },
  {
    id: 'sinusoidal',
    name: 'Sinusoidal (Many Minima)',
    f: x => 2 * Math.sin(x) + 0.2 * x * x,
    df: x => 2 * Math.cos(x) + 0.4 * x,
    formulaLatex: '2\\sin(x) + 0.2x^2',
    derivativeLatex: '2\\cos(x) + 0.4x',
    domain: [-6, 6],
    range: [-3, 10],
  },
];

export const learningRates = [0.001, 0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0];

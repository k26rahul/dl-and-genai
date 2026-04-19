export const functions = [
  {
    id: 'sphere',
    name: 'Shifted Sphere (Simple 5D Bowl)',
    // Global minimum at [1, -2, 0, 2, -1], Min Z = 0
    f: p =>
      Math.pow(p[0] - 1, 2) +
      Math.pow(p[1] + 2, 2) +
      Math.pow(p[2] - 0, 2) +
      Math.pow(p[3] - 2, 2) +
      Math.pow(p[4] + 1, 2),
    grad: p => [
      2 * (p[0] - 1),
      2 * (p[1] + 2),
      2 * (p[2] - 0),
      2 * (p[3] - 2),
      2 * (p[4] + 1),
    ],
    fLatex: '(x_1-1)^2 + (x_2+2)^2 + x_3^2 + (x_4-2)^2 + (x_5+1)^2',
    gradLatex: '[2(x_1-1),\\ 2(x_2+2),\\ 2x_3,\\ 2(x_4-2),\\ 2(x_5+1)]',
    domain: [-5, 5],
  },
  {
    id: 'elliptic',
    name: 'Elliptic Valley (Unequal Weights)',
    // Global minimum at [0, 1, -1, 3, 0], Min Z = 5
    f: p =>
      2 * Math.pow(p[0], 2) +
      0.5 * Math.pow(p[1] - 1, 2) +
      3 * Math.pow(p[2] + 1, 2) +
      Math.pow(p[3] - 3, 2) +
      1.5 * Math.pow(p[4], 2) +
      5,
    grad: p => [4 * p[0], 1 * (p[1] - 1), 6 * (p[2] + 1), 2 * (p[3] - 3), 3 * p[4]],
    fLatex: '2x_1^2 + 0.5(x_2-1)^2 + 3(x_3+1)^2 + (x_4-3)^2 + 1.5x_5^2 + 5',
    gradLatex: '[4x_1,\\ (x_2-1),\\ 6(x_3+1),\\ 2(x_4-3),\\ 3x_5]',
    domain: [-5, 5],
  },
];

export const learningRates = [0.001, 0.01, 0.05, 0.1, 0.2, 0.5];

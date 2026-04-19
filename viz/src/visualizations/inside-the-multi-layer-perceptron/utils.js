// ==========================================
// Math & Matrix Utilities (NumPy in JS)
// ==========================================

export const randomGaussian = () => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

export const zeros = (rows, cols) =>
  Array(rows).fill(0).map(() => Array(cols).fill(0));

export const randomMatrix = (rows, cols, scale = 0.1) =>
  Array(rows).fill(0).map(() =>
    Array(cols).fill(0).map(() => randomGaussian() * scale)
  );

export const matMul = (A, B) => {
  const result = zeros(A.length, B[0].length);
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B[0].length; j++) {
      let sum = 0;
      for (let k = 0; k < A[0].length; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
};

export const transpose = A => A[0].map((_, colIndex) => A.map(row => row[colIndex]));

export const addBias = (A, b) => A.map(row => row.map((val, j) => val + b[0][j]));

export const relu = Z => Z.map(row => row.map(val => Math.max(0, val)));
export const reluBackward = (dA, Z) =>
  dA.map((row, i) => row.map((val, j) => (Z[i][j] > 0 ? val : 0)));

export const sigmoid = Z => Z.map(row => row.map(val => 1 / (1 + Math.exp(-val))));
export const sigmoidBackward = (dA, Z) => {
  const s = sigmoid(Z);
  return dA.map((row, i) => row.map((val, j) => val * s[i][j] * (1 - s[i][j])));
};

export const clip = (val, min, max) => Math.min(Math.max(val, min), max);

export const bceLoss = (A, Y) => {
  let sum = 0;
  const n = Y.length;
  for (let i = 0; i < n; i++) {
    const a = clip(A[i][0], 1e-9, 1 - 1e-9);
    const y = Y[i][0];
    sum += y * Math.log(a) + (1 - y) * Math.log(1 - a);
  }
  return -sum / n;
};

export const bceLossBackward = (A, Y) => {
  const n = Y.length;
  return A.map((row, i) => {
    const a = clip(row[0], 1e-9, 1 - 1e-9);
    const y = Y[i][0];
    return [(-y / a + (1 - y) / (1 - a)) / n];
  });
};

export const updateParams = (W, dW, b, db, lr) => {
  const newW = W.map((row, i) => row.map((val, j) => val - lr * dW[i][j]));
  const newB = b.map((row, i) => row.map((val, j) => val - lr * db[i][j]));
  return { newW, newB };
};

export const sumAxis0 = A => {
  const result = zeros(1, A[0].length);
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A[0].length; j++) {
      result[0][j] += A[i][j];
    }
  }
  return result;
};

export const getDerivativeColor = slope => {
  const absM = Math.abs(slope);
  const intensity = Math.min(absM / 10, 1);
  if (Math.abs(slope) < 0.01) return 'rgb(156, 163, 175)';
  if (slope > 0) {
    const r = Math.round(150 * (1 - intensity));
    const g = Math.round(180 + 75 * intensity);
    const b = Math.round(150 * (1 - intensity));
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const r = Math.round(180 + 75 * intensity);
    const g = Math.round(150 * (1 - intensity));
    const b = Math.round(150 * (1 - intensity));
    return `rgb(${r}, ${g}, ${b})`;
  }
};

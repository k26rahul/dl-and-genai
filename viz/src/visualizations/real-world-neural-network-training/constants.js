export const METADATA_URL =
  'https://raw.githubusercontent.com/k26rahul/dl-and-genai/refs/heads/main' +
  '/viz/src/visualizations/datasets/metadata.json';

const IDB_DB = 'nnviz-datasets';
const IDB_STORE = 'datasets';

export function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}
export async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(key);
    req.onsuccess = e => resolve(e.target.result ?? null);
    req.onerror = e => reject(e.target.error);
  });
}
export async function idbSet(key, value) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, 'readwrite').objectStore(IDB_STORE).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
}
export async function idbClear() {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, 'readwrite').objectStore(IDB_STORE).clear();
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
}

export const EPOCH_OPTIONS = [50, 100, 150, 200, 300, 500];

export const shuffleData = (X, y) => {
  const indices = Array.from({ length: X.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return {
    shuffledX: indices.map(i => X[i]),
    shuffledY: indices.map(i => y[i]),
  };
};

export const splitData = (X, y, splitRatio = 0.8) => {
  const splitIdx = Math.floor(X.length * splitRatio);
  return {
    trainX: X.slice(0, splitIdx),
    trainY: y.slice(0, splitIdx),
    testX: X.slice(splitIdx),
    testY: y.slice(splitIdx),
  };
};

export const clip = (val, min, max) => Math.min(Math.max(val, min), max);

export const getScheduledLr = (epochIdx, initialLr, scheduleType) => {
  if (scheduleType === 'step') {
    return initialLr * Math.pow(0.5, Math.floor(epochIdx / 30));
  } else if (scheduleType === 'exp') {
    return initialLr * Math.exp(-0.03 * epochIdx);
  } else if (scheduleType === 'cosine') {
    return initialLr * 0.5 * (1 + Math.cos((Math.PI * (epochIdx % 50)) / 50));
  }
  return initialLr;
};

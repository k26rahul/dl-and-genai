import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as tf from '@tensorflow/tfjs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// ==========================================
// 1. CONFIGURATION & DATA ACCESS
// ==========================================
const METADATA_URL =
  'https://raw.githubusercontent.com/k26rahul/dl-and-genai/refs/heads/main' +
  '/viz/src/visualizations/datasets/metadata.json';

// ── IndexedDB cache helpers (module-level, no extra dependencies) ────────────
const IDB_DB = 'nnviz-datasets';
const IDB_STORE = 'datasets';

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = e => reject(e.target.error);
  });
}
async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(key);
    req.onsuccess = e => resolve(e.target.result ?? null);
    req.onerror = e => reject(e.target.error);
  });
}
async function idbSet(key, value) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, 'readwrite').objectStore(IDB_STORE).put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
}
async function idbClear() {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, 'readwrite').objectStore(IDB_STORE).clear();
    req.onsuccess = () => resolve();
    req.onerror = e => reject(e.target.error);
  });
}

const EPOCH_OPTIONS = [50, 100, 150, 200, 300, 500];

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================
const shuffleData = (X, y) => {
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

const splitData = (X, y, splitRatio = 0.8) => {
  const splitIdx = Math.floor(X.length * splitRatio);
  return {
    trainX: X.slice(0, splitIdx),
    trainY: y.slice(0, splitIdx),
    testX: X.slice(splitIdx),
    testY: y.slice(splitIdx),
  };
};

const clip = (val, min, max) => Math.min(Math.max(val, min), max);

// ==========================================
// 2.5 LEARNING RATE SCHEDULER LOGIC
// ==========================================
const getScheduledLr = (epochIdx, initialLr, scheduleType) => {
  if (scheduleType === 'step') {
    return initialLr * Math.pow(0.5, Math.floor(epochIdx / 30));
  } else if (scheduleType === 'exp') {
    return initialLr * Math.exp(-0.03 * epochIdx);
  } else if (scheduleType === 'cosine') {
    return initialLr * 0.5 * (1 + Math.cos((Math.PI * (epochIdx % 50)) / 50));
  }
  return initialLr; // constant
};

// ==========================================
// 3. MAIN APPLICATION
// ==========================================
export default function App() {
  // --- Core State ---
  const [selectedDataset, setSelectedDataset] = useState(null); // set by metadata
  const [allDatasets, setAllDatasets] = useState({});           // populated from metadata.json
  const [metaInfo, setMetaInfo] = useState(null);               // { generatedAt, defaultDataset }
  const [dataLoaded, setDataLoaded] = useState(false);
  const [rawData, setRawData] = useState(null);
  // Download state: null = idle, -1 = indeterminate, 0-100 = percent
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [cacheHit, setCacheHit] = useState(false);

  // --- Network Architecture ---
  const [depth, setDepth] = useState(2);
  const [neurons, setNeurons] = useState([16, 8, 8]); // Max 3 layers

  // --- Hyperparameters ---
  const [batchSize, setBatchSize] = useState('32');
  const [baseLr, setBaseLr] = useState(0.05);
  const [lrSchedule, setLrSchedule] = useState('constant');
  const [throttle, setThrottle] = useState(0); // ms
  const [maxEpochs, setMaxEpochs] = useState(150);

  // --- Training State ---
  const [isTraining, setIsTraining] = useState(false);
  const isTrainingRef = useRef(false); // For async interruption
  const [epoch, setEpoch] = useState(0);
  const [history, setHistory] = useState([]);
  const [predictions, setPredictions] = useState({ train: null, test: null });
  const [currentLr, setCurrentLr] = useState(baseLr);
  const modelRef = useRef(null);

  // --- Data Preview States ---
  const [dataSplit, setDataSplit] = useState(null);
  const splitRef = useRef(null);
  const [trainIndices, setTrainIndices] = useState([]);
  const [testIndices, setTestIndices] = useState([]);
  const trainIndicesRef = useRef([]);
  const testIndicesRef = useRef([]);
  const normStatsRef = useRef(null);
  const [isTrainTableOpen, setIsTrainTableOpen] = useState(false);
  const [isTestTableOpen, setIsTestTableOpen] = useState(true);

  // --- UI State ---
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [expandedLayers, setExpandedLayers] = useState({});

  const get10Random = max => {
    if (!max) return [];
    const count = Math.min(10, max);
    const chosen = new Set();
    while (chosen.size < count) {
      chosen.add(Math.floor(Math.random() * max));
    }
    return Array.from(chosen);
  };

  const updatePredictionsForIndices = (tIdx, tsIdx) => {
    if (!modelRef.current || !splitRef.current || !normStatsRef.current) return;
    tf.tidy(() => {
      const mean = tf.tensor1d(normStatsRef.current.mean);
      const std = tf.tensor1d(normStatsRef.current.std);
      const trSelect = tIdx.map(i => splitRef.current.trainX[i]);
      const tsSelect = tsIdx.map(i => splitRef.current.testX[i]);
      
      let trPred = null, tsPred = null;
      if (trSelect.length > 0) trPred = modelRef.current.predict(tf.tensor2d(trSelect).sub(mean).div(std)).arraySync();
      if (tsSelect.length > 0) tsPred = modelRef.current.predict(tf.tensor2d(tsSelect).sub(mean).div(std)).arraySync();
      
      setPredictions({ train: trPred, test: tsPred });
    });
  };

  const rollTrainDice = (e) => {
    e.stopPropagation();
    if (!splitRef.current) return;
    const idx = get10Random(splitRef.current.trainX.length);
    setTrainIndices(idx);
    trainIndicesRef.current = idx;
    updatePredictionsForIndices(idx, testIndicesRef.current);
  };

  const rollTestDice = (e) => {
    e.stopPropagation();
    if (!splitRef.current) return;
    const idx = get10Random(splitRef.current.testX.length);
    setTestIndices(idx);
    testIndicesRef.current = idx;
    updatePredictionsForIndices(trainIndicesRef.current, idx);
  };

  // Derived: active dataset config (null while metadata is loading)
  const dsConfig = selectedDataset ? allDatasets[selectedDataset] ?? null : null;

  // React to Base LR or Schedule changes instantly, while keeping the dot on the curve!
  useEffect(() => {
    if (!isTraining) {
      setCurrentLr(getScheduledLr(epoch, baseLr, lrSchedule));
    }
  }, [baseLr, lrSchedule, epoch, isTraining]);

  const resetTraining = () => {
    stopTraining();
    setHistory([]);
    setEpoch(0);
    setPredictions([]);
    setCurrentLr(baseLr);
    if (modelRef.current) {
      modelRef.current.dispose();
      modelRef.current = null;
    }
  };

  // ==========================================
  // METADATA LOADING (once on mount)
  // ==========================================
  useEffect(() => {
    fetch(METADATA_URL)
      .then(r => r.json())
      .then(meta => {
        setAllDatasets(meta.datasets);
        setMetaInfo(meta);
        setSelectedDataset(meta.defaultDataset);
      })
      .catch(err => console.error('Failed to load metadata:', err));
  }, []);

  // ==========================================
  // DATASET LOADING (streaming fetch + IndexedDB cache)
  // ==========================================
  useEffect(() => {
    if (!selectedDataset || !metaInfo || !allDatasets[selectedDataset]) return;

    let cancelled = false;
    const dsConf = allDatasets[selectedDataset];
    // Cache key encodes generatedAt so regenerated datasets automatically bust the cache
    const cacheKey = `${selectedDataset}__${metaInfo.generatedAt}`;

    // Reset all training state on dataset switch
    setDataLoaded(false);
    setRawData(null);
    setHistory([]);
    setEpoch(0);
    setPredictions({ train: null, test: null });
    setIsTraining(false);
    isTrainingRef.current = false;
    if (modelRef.current) { modelRef.current.dispose(); modelRef.current = null; }
    setCacheHit(false);

    async function load() {
      const processData = (data) => {
        setRawData(data);
        setDataLoaded(true);
        const shuffled = shuffleData(data.X, data.y);
        const split = splitData(shuffled.shuffledX, shuffled.shuffledY, 0.8);
        setDataSplit(split);
        splitRef.current = split;
        const tIdx = get10Random(split.trainX.length);
        const tsIdx = get10Random(split.testX.length);
        setTrainIndices(tIdx);
        setTestIndices(tsIdx);
        trainIndicesRef.current = tIdx;
        testIndicesRef.current = tsIdx;
      };

      // 1. Try IndexedDB first
      try {
        const cached = await idbGet(cacheKey);
        if (cached && !cancelled) {
          processData(cached);
          setCacheHit(true);
          return;
        }
      } catch (_) { /* IDB unavailable — fall through to network */ }

      // 2. Streaming fetch with progress
      if (cancelled) return;
      setDownloadProgress(-1); // indeterminate until Content-Length arrives

      try {
        const response = await fetch(dsConf.url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const contentLength = response.headers.get('Content-Length');
        const total = contentLength ? parseInt(contentLength, 10) : null;
        if (total) setDownloadProgress(0);

        const reader = response.body.getReader();
        const chunks = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (cancelled) { reader.cancel(); return; }
          chunks.push(value);
          received += value.length;
          if (total) setDownloadProgress(Math.round((received / total) * 100));
        }

        // Assemble chunks → string → JSON
        const all = new Uint8Array(received);
        let pos = 0;
        for (const chunk of chunks) { all.set(chunk, pos); pos += chunk.length; }
        const data = JSON.parse(new TextDecoder().decode(all));

        // 3. Cache in IndexedDB for next time
        try { await idbSet(cacheKey, data); } catch (_) { /* quota full — skip */ }

        if (!cancelled) {
          processData(data);
        }
      } catch (err) {
        if (!cancelled) console.error('Dataset fetch failed:', err);
      } finally {
        if (!cancelled) setDownloadProgress(null);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [selectedDataset, metaInfo]);

  const precomputeLrCurve = () => {
    const pts = [];
    for (let i = 0; i <= maxEpochs; i++) {
      pts.push(getScheduledLr(i, baseLr, lrSchedule));
    }
    return pts;
  };
  const lrCurve = useMemo(precomputeLrCurve, [baseLr, lrSchedule, maxEpochs]);

  // ==========================================
  // TRAINING LOOP
  // ==========================================
  const startTraining = async () => {
    if (!dataLoaded || !rawData) return;

    setIsTraining(true);
    isTrainingRef.current = true;

    // Fresh start — wipe previous run state and dispose old model
    if (modelRef.current) {
      modelRef.current.dispose();
      modelRef.current = null;
    }
    setHistory([]);
    setEpoch(0);
    setPredictions({ train: null, test: null });

    // 1. Data Prep (Shuffle & Split)
    const shuffled = shuffleData(rawData.X, rawData.y);
    const { trainX, trainY, testX, testY } = splitData(shuffled.shuffledX, shuffled.shuffledY, 0.8);
    const split = { trainX, trainY, testX, testY };
    setDataSplit(split);
    splitRef.current = split;

    // 2. TFJS Tensors & Normalization
    tf.engine().startScope(); // Memory management

    const xTrainRaw = tf.tensor2d(trainX);
    const yTrainRaw = tf.tensor2d(trainY);
    const xTestRaw = tf.tensor2d(testX);
    const yTestRaw = tf.tensor2d(testY);

    // Standardization (Z-score normalization based ONLY on train data)
    const mean = xTrainRaw.mean(0);
    const std = xTrainRaw.squaredDifference(mean).mean(0).sqrt().add(1e-7);
    normStatsRef.current = { mean: mean.arraySync(), std: std.arraySync() };

    const xTrainNorm = xTrainRaw.sub(mean).div(std);
    const xTestNorm = xTestRaw.sub(mean).div(std);

    // 3. Build Model (always fresh start)
    const model = tf.sequential();
    const numFeatures = rawData.features.length;

    for (let i = 0; i < depth; i++) {
      model.add(
        tf.layers.dense({
          units: neurons[i],
          activation: 'relu',
          inputShape: i === 0 ? [numFeatures] : undefined,
          kernelInitializer: 'heNormal',
        }),
      );
    }
    model.add(
      tf.layers.dense({
        units: dsConfig.outNeurons,
        activation: dsConfig.activation,
        kernelInitializer: 'glorotNormal',
      }),
    );

    model.compile({
      optimizer: tf.train.adam(baseLr),
      loss: dsConfig.loss,
      metrics: [dsConfig.metric === 'meanAbsoluteError' ? 'mae' : dsConfig.metric],
    });

    modelRef.current = model;

    const parsedBatchSize =
      batchSize === 'Full' ? trainX.length : parseInt(batchSize, 10);

    // 4. Custom Fit Loop — always start from epoch 1
    for (let e = 1; e <= maxEpochs; e++) {
      if (!isTrainingRef.current) break;

      const currentEpochLr = getScheduledLr(e, baseLr, lrSchedule);
      model.optimizer.learningRate = currentEpochLr;
      setCurrentLr(currentEpochLr);

      const h = await model.fit(xTrainNorm, yTrainRaw, {
        batchSize: parsedBatchSize,
        epochs: 1,
        validationData: [xTestNorm, yTestRaw],
        verbose: 0,
      });

      const metrics = h.history;

      // Safely extract metrics to avoid crashes based on TFJS abbreviation quirks
      const trainLoss = metrics.loss ? metrics.loss[0] : 0;
      const testLoss = metrics.val_loss ? metrics.val_loss[0] : 0;
      const trainMetric = (metrics[dsConfig.metric] ||
        metrics['acc'] ||
        metrics['mae'] || [0])[0];
      const testMetric = (metrics[`val_${dsConfig.metric}`] ||
        metrics['val_acc'] ||
        metrics['val_mae'] || [0])[0];

      setHistory(prev => [
        ...prev,
        {
          epoch: e,
          trainLoss,
          testLoss,
          trainMetric,
          testMetric,
        },
      ]);
      setEpoch(e);

      // Update live predictions
      if ((isTrainTableOpen || isTestTableOpen) && e % 2 === 0) {
        updatePredictionsForIndices(trainIndicesRef.current, testIndicesRef.current);
      }

      // Throttling
      if (throttle > 0) {
        await new Promise(r => setTimeout(r, throttle));
      } else {
        await tf.nextFrame(); // Let UI breathe
      }
    }

    // Final prediction fetch when training finishes
    updatePredictionsForIndices(trainIndicesRef.current, testIndicesRef.current);

    setIsTraining(false);
    isTrainingRef.current = false;
    tf.engine().endScope(); // Free data tensors (model weights survive as tf.Variables)
  };

  const stopTraining = () => {
    setIsTraining(false);
    isTrainingRef.current = false;
  };

  // ==========================================
  // SVG CHART RENDERERS
  // ==========================================
  const renderChart = type => {
    if (history.length === 0) return null;
    let key1, key2, color1, color2, domain;
    
    if (type === 'loss') {
      key1 = 'trainLoss';
      key2 = 'testLoss';
      color1 = '#3b82f6';
      color2 = '#f97316';
      domain = ['auto', 'auto'];
    } else {
      key1 = 'trainMetric';
      key2 = 'testMetric';
      color1 = '#22c55e';
      color2 = '#ef4444';
      if (dsConfig.type === 'classification') {
        domain = [0, 1];
      } else {
        domain = ['auto', 'auto'];
      }
    }

    return (
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' vertical={false} />
          <XAxis 
            dataKey='epoch' 
            type='number' 
            domain={[1, maxEpochs]} 
            tick={{ fontSize: 10, fill: '#94a3b8' }} 
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis 
            domain={domain} 
            tick={{ fontSize: 10, fill: '#94a3b8' }} 
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            tickFormatter={val => val.toFixed(2)}
          />
          <Tooltip 
            contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            labelStyle={{ fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}
            formatter={(value, name) => [value.toFixed(4), name]}
            labelFormatter={(label) => `Epoch ${label}`}
            isAnimationActive={false}
          />
          <Line
            type='monotone'
            dataKey={key1}
            name={type === 'loss' ? 'Train Loss' : (dsConfig.type === 'classification' ? 'Train Accuracy' : 'Train MAE')}
            stroke={color1}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type='monotone'
            dataKey={key2}
            name={type === 'loss' ? 'Test Loss' : (dsConfig.type === 'classification' ? 'Test Accuracy' : 'Test MAE')}
            stroke={color2}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderLrChart = () => {
    const w = 150,
      h = 40;
    const maxLr = Math.max(...lrCurve);
    const mapX = e => (e / maxEpochs) * w;
    const mapY = v => h - (v / Math.max(0.001, maxLr)) * h;
    const path = lrCurve
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${mapX(i)} ${mapY(v)}`)
      .join(' ');

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className='w-full h-full overflow-visible'>
        <path
          d={path}
          fill='none'
          stroke='#8b5cf6'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          opacity='0.5'
        />
        <circle cx={mapX(epoch)} cy={mapY(currentLr)} r='3' fill='#6d28d9' />
      </svg>
    );
  };

  const latestMetric = history.length > 0 ? history[history.length - 1] : null;

  // Dataset stats (derived from rawData)
  const totalRows = rawData ? rawData.X.length : null;
  const trainRows = totalRows ? Math.floor(totalRows * 0.8) : null;
  const testRows = totalRows ? totalRows - trainRows : null;
  const parsedBatchSizeForStats =
    batchSize === 'Full' ? trainRows : parseInt(batchSize, 10);
  const trainBatches =
    trainRows && parsedBatchSizeForStats
      ? Math.ceil(trainRows / parsedBatchSizeForStats)
      : null;
  const testBatches =
    testRows && parsedBatchSizeForStats
      ? Math.ceil(testRows / parsedBatchSizeForStats)
      : null;

  // Guard: render a simple spinner while metadata.json is being fetched (~1 req)
  if (!metaInfo || !dsConfig) {
    return (
      <div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-500'>
        <div className='w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin' />
        <p className='text-sm font-medium'>Loading datasets…</p>
      </div>
    );
  }

  const renderPreviewTable = (type, indices, dataX, dataY, predArrayGroup, isOpen, toggleOpen, diceRoll) => {
    if (!dataX || !dataY || indices.length === 0) return null;
    return (
      <div className='bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden mb-3'>
        <div 
          className='bg-slate-800 p-2 flex justify-between items-center cursor-pointer hover:bg-slate-700 transition-colors' 
          onClick={toggleOpen}
        >
          <h2 className='text-xs font-bold text-white flex items-center gap-2'>
            {type === 'Train' ? '🚂' : '🧪'} {type} Samples (10 random)
          </h2>
          <div className='flex items-center gap-3'>
             <button onClick={diceRoll} className='text-lg hover:scale-110 transition-transform' title='Randomize'>🎲</button>
             <span className='text-slate-400 text-[10px]'>{isOpen ? '▼' : '▶'}</span>
          </div>
        </div>
        {isOpen && (
          <div className='overflow-x-auto p-0 border-t border-slate-200'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-slate-100 text-[9px] md:text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-200'>
                  <th className='px-2 py-1 font-semibold w-12'>Index</th>
                  <th className='px-2 py-1 font-semibold'>Features (X)</th>
                  <th className='px-2 py-1 font-semibold text-center'>Pred</th>
                  <th className='px-2 py-1 font-semibold text-center'>True</th>
                  <th className='px-2 py-1 font-semibold text-right'>Err</th>
                </tr>
              </thead>
              <tbody>
                {indices.map((idx, i) => {
                   const x = dataX[idx];
                   const trueDisplay = dsConfig.type === 'classification' ? (dsConfig.classes === 2 ? dataY[idx][0] : dataY[idx].indexOf(1)) : dataY[idx][0];
                   const predArray = predArrayGroup ? predArrayGroup[i] : null;
                   
                   let predDisplay = '---', errDisplay = '---', isCorrect = false;
                   if (predArray) {
                     if (dsConfig.type === 'classification') {
                       if (dsConfig.classes === 2) {
                         const p = predArray[0];
                         predDisplay = p.toFixed(4);
                         isCorrect = (p >= 0.5 ? 1 : 0) === trueDisplay;
                         const pClipped = Math.max(1e-9, Math.min(p, 1 - 1e-9));
                         errDisplay = (-(trueDisplay * Math.log(pClipped) + (1 - trueDisplay) * Math.log(1 - pClipped))).toFixed(4);
                       } else {
                         const pClass = predArray.indexOf(Math.max(...predArray));
                         predDisplay = `Class ${pClass}`;
                         isCorrect = pClass === trueDisplay;
                         const pClipped = Math.max(1e-9, Math.min(predArray[trueDisplay], 1 - 1e-9));
                         errDisplay = (-Math.log(pClipped)).toFixed(4);
                       }
                     } else {
                       predDisplay = predArray[0].toFixed(4);
                       errDisplay = Math.abs(predArray[0] - trueDisplay).toFixed(4);
                     }
                   }

                   const rowColor = (isTraining || predArrayGroup) && predArray ? (isCorrect && dsConfig.type === 'classification' ? 'bg-green-50/50' : (dsConfig.type === 'classification' ? 'bg-red-50/50' : 'bg-blue-50/50')) : '';
                   return (
                     <tr key={`${type}-${idx}-${i}`} className={`border-b border-slate-100 font-mono text-[9px] md:text-[11px] ${rowColor}`}>
                       <td className='px-2 py-1 text-slate-400'>#{idx}</td>
                       <td className='px-2 py-1 text-slate-600 truncate max-w-[150px]'>
                         [{x.slice(0, 4).map(v => v.toFixed(1)).join(', ')}{x.length > 4 ? '...' : ''}]
                       </td>
                       <td className='px-2 py-1 text-center font-bold text-blue-600'>{predDisplay}</td>
                       <td className='px-2 py-1 text-center font-bold text-slate-800'>{trueDisplay}</td>
                       <td className='px-2 py-1 text-right text-red-500'>{errDisplay}</td>
                     </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 p-2 md:p-4 font-sans'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <header className='mb-3 md:mb-5 text-center'>
          <h1 className='text-xl md:text-3xl font-bold text-slate-900 mb-1'>
            Real-World Neural Network Training
          </h1>
          <p className='text-[11px] md:text-sm text-slate-600'>
            Train an MLP on real datasets to explore Loss, Accuracy, and Overfitting.
          </p>
        </header>

        {/* Global Grid */}
        <div className='flex flex-col lg:grid lg:grid-cols-12 gap-3 md:gap-5 mb-4 md:mb-6'>
          {/* ========================================== */}
          {/* TOP CONTROLS (Order 1 on mobile, Span 12)    */}
          {/* ========================================== */}
          <div className='order-1 lg:col-span-12 bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm border border-slate-200'>
            <div className='flex flex-wrap gap-4 items-end'>
              {/* Train / Stop */}
              <div className='flex-shrink-0 w-full sm:w-auto flex gap-2'>
                {isTraining ? (
                  <button
                    onClick={stopTraining}
                    className='flex-1 sm:flex-none sm:w-28 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors text-sm flex justify-center items-center gap-2'
                  >
                    ⏹ Stop
                  </button>
                ) : (
                  <button
                    onClick={startTraining}
                    disabled={!dataLoaded || downloadProgress !== null}
                    className={`flex-1 sm:flex-none sm:w-28 font-bold py-2 px-4 rounded-lg shadow-sm transition-colors text-sm flex justify-center items-center gap-2 ${
                      !dataLoaded || downloadProgress !== null
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {downloadProgress !== null
                      ? 'Downloading…'
                      : !dataLoaded
                      ? 'Loading…'
                      : '▶ Train'}
                  </button>
                )}
              </div>

              {/* Architecture & Config Dropdowns */}
              <div className='flex flex-wrap flex-1 gap-x-6 gap-y-3 items-end'>
                <div className='flex flex-col w-full sm:w-auto'>
                  <div className='flex items-center justify-between mb-1 gap-3'>
                    <label className='text-[10px] font-bold text-slate-500 uppercase'>
                      Target Dataset
                    </label>
                    <div className='flex items-center gap-2'>
                      {cacheHit && (
                        <span className='text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded'>
                          ⚡ cached
                        </span>
                      )}
                      <button
                        onClick={async () => { await idbClear(); setCacheHit(false); }}
                        className='text-[9px] text-slate-400 hover:text-red-500 transition-colors'
                        title='Clear all cached datasets from IndexedDB'
                      >
                        clear cache
                      </button>
                    </div>
                  </div>
                  <select
                    value={selectedDataset ?? ''}
                    onChange={e => setSelectedDataset(e.target.value)}
                    disabled={isTraining || downloadProgress !== null}
                    className='bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-xs md:text-sm font-semibold'
                  >
                    {['Binary Classification', 'Multiclass Classification', 'Regression'].map(groupName => {
                      const groupDatasets = Object.values(allDatasets).filter(ds => {
                        if (groupName === 'Binary Classification') return ds.type === 'classification' && ds.classes === 2;
                        if (groupName === 'Multiclass Classification') return ds.type === 'classification' && ds.classes > 2;
                        return ds.type === 'regression';
                      });
                      if (groupDatasets.length === 0) return null;
                      return (
                        <optgroup key={groupName} label={groupName}>
                          {groupDatasets.map(ds => (
                            <option key={ds.id} value={ds.id}>
                              {ds.name}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>

                <div className='flex flex-col w-full sm:w-auto'>
                  <label className='text-[10px] font-bold text-slate-500 uppercase mb-1'>
                    Hidden Layers
                  </label>
                  <select
                    value={depth}
                    onChange={e => setDepth(Number(e.target.value))}
                    disabled={isTraining}
                    className='bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-xs md:text-sm font-semibold'
                  >
                    <option value={1}>1 Layer</option>
                    <option value={2}>2 Layers</option>
                    <option value={3}>3 Layers</option>
                  </select>
                </div>

                <div className='flex gap-2 w-full sm:w-auto'>
                  {[...Array(depth)].map((_, i) => (
                    <div key={i} className='flex flex-col'>
                      <label className='text-[10px] font-bold text-indigo-500 uppercase mb-1'>
                        L{i + 1} Neurons
                      </label>
                      <select
                        value={neurons[i]}
                        onChange={e => {
                          const n = [...neurons];
                          n[i] = Number(e.target.value);
                          setNeurons(n);
                        }}
                        disabled={isTraining}
                        className='bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-md px-2 py-1.5 text-xs font-mono shadow-inner'
                      >
                        <option value={8}>8</option>
                        <option value={16}>16</option>
                        <option value={32}>32</option>
                        <option value={64}>64</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Max Epochs */}
              <div className='flex flex-col w-full sm:w-auto'>
                <label className='text-[10px] font-bold text-slate-500 uppercase mb-1'>
                  Max Epochs
                </label>
                <select
                  value={maxEpochs}
                  onChange={e => { setMaxEpochs(Number(e.target.value)); resetTraining(); }}
                  disabled={isTraining}
                  className='bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-xs md:text-sm font-semibold'
                >
                  {EPOCH_OPTIONS.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Readouts */}
              <div className='flex items-center justify-center gap-3 md:gap-4 bg-slate-100 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-slate-200 w-full lg:w-auto ml-auto'>
                <div className='text-center'>
                  <span className='text-slate-500 font-semibold uppercase tracking-wider text-[9px] md:text-[10px]'>
                    Epoch
                  </span>
                  <div className='font-mono text-base md:text-lg font-bold text-slate-800 leading-none mt-0.5 md:mt-1'>
                    {epoch}
                  </div>
                </div>
                <div className='w-px h-6 md:h-8 bg-slate-300'></div>
                <div className='text-center w-16 md:w-20'>
                  <span className='text-slate-500 font-semibold uppercase tracking-wider text-[9px] md:text-[10px]'>
                    Mean Loss
                  </span>
                  <div className='font-mono text-base md:text-lg font-bold text-red-500 leading-none mt-0.5 md:mt-1'>
                    {history.length > 0
                      ? history[history.length - 1].trainLoss.toFixed(4)
                      : '---'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* LEFT COLUMN: CHARTS (Order 2 on Mobile)      */}
          {/* ========================================== */}
          <div className='order-2 lg:col-span-5 flex flex-col gap-3 md:gap-5'>
            {/* Loss Chart */}
            <div className='bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm border border-slate-200 flex-1 min-h-[220px] flex flex-col'>
              <div className='flex justify-between items-center mb-2 md:mb-4'>
                <h2 className='text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide'>
                  Loss Curve ({
                    dsConfig.loss === 'binaryCrossentropy' ? 'Binary Cross-Entropy' :
                    dsConfig.loss === 'categoricalCrossentropy' ? 'Categorical Cross-Entropy' :
                    'Mean Squared Error'
                  })
                </h2>
                <div className='flex gap-3 text-[10px] md:text-xs font-bold'>
                  <span className='flex items-center gap-1 text-blue-600'>
                    <div className='w-2 h-2 rounded-full bg-blue-500'></div> Train Loss{' '}
                    {latestMetric ? `(${latestMetric.trainLoss.toFixed(4)})` : ''}
                  </span>
                  <span className='flex items-center gap-1 text-orange-500'>
                    <div className='w-2 h-2 rounded-full bg-orange-400'></div> Test Loss{' '}
                    {latestMetric ? `(${latestMetric.testLoss.toFixed(4)})` : ''}
                  </span>
                </div>
              </div>
              <div className='flex-1 w-full bg-slate-50 rounded-lg border border-slate-100 relative'>
                {history.length === 0 ? (
                  <div className='absolute inset-0 flex items-center justify-center text-slate-400 text-xs'>
                    Awaiting Training...
                  </div>
                ) : (
                  <div className='w-full h-full p-2'>{renderChart('loss')}</div>
                )}
              </div>
            </div>

            {/* Metric Chart */}
            <div className='bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm border border-slate-200 flex-1 min-h-[220px] flex flex-col'>
              <div className='flex justify-between items-center mb-2 md:mb-4'>
                <h2 className='text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide'>
                  Performance (
                  {dsConfig.type === 'classification' ? 'Accuracy' : 'Mean Abs Error'})
                </h2>
                <div className='flex gap-3 text-[10px] md:text-xs font-bold'>
                  <span className='flex items-center gap-1 text-green-600'>
                    <div className='w-2 h-2 rounded-full bg-green-500'></div>{' '}
                    Train {dsConfig.type === 'classification' ? 'Accuracy' : 'MAE'}{' '}
                    {latestMetric ? `(${latestMetric.trainMetric.toFixed(4)})` : ''}
                  </span>
                  <span className='flex items-center gap-1 text-red-500'>
                    <div className='w-2 h-2 rounded-full bg-red-500'></div>{' '}
                    Test {dsConfig.type === 'classification' ? 'Accuracy' : 'MAE'}{' '}
                    {latestMetric ? `(${latestMetric.testMetric.toFixed(4)})` : ''}
                  </span>
                </div>
              </div>
              <div className='flex-1 w-full bg-slate-50 rounded-lg border border-slate-100 relative'>
                {history.length === 0 ? (
                  <div className='absolute inset-0 flex items-center justify-center text-slate-400 text-xs'>
                    Awaiting Training...
                  </div>
                ) : (
                  <div className='w-full h-full p-2'>{renderChart('metric')}</div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* RIGHT COLUMN WRAPPER                       */}
          {/* ========================================== */}
          <div className='order-3 lg:col-span-7 flex flex-col gap-2 md:gap-4 lg:gap-5'>
            {/* ========================================== */}
            {/* HYPERPARAMS & ARCHITECTURE                   */}
            {/* ========================================== */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5'>
              {/* Hyperparameters */}
              <div className='bg-indigo-50 p-3 md:p-5 rounded-xl md:rounded-2xl shadow-sm border border-indigo-100'>
                <h2 className='text-xs md:text-sm font-bold text-indigo-900 uppercase tracking-wide border-b border-indigo-200 pb-2 mb-3'>
                  Hyperparameters
                </h2>

                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <label className='text-[11px] md:text-xs font-bold text-indigo-800'>
                      Batch Size
                    </label>
                    <select
                      value={batchSize}
                      onChange={e => setBatchSize(e.target.value)}
                      disabled={isTraining}
                      className='bg-white border border-indigo-200 rounded px-2 py-1 text-xs font-mono shadow-sm w-28'
                    >
                      <option value='1'>1 (SGD)</option>
                      <option value='8'>8</option>
                      <option value='16'>16</option>
                      <option value='32'>32</option>
                      <option value='64'>64</option>
                      <option value='128'>128</option>
                      <option value='256'>256</option>
                      <option value='Full'>Full Batch</option>
                    </select>
                  </div>

                  <div className='flex justify-between items-center'>
                    <label className='text-[11px] md:text-xs font-bold text-indigo-800'>
                      Anim Throttle
                    </label>
                    <select
                      value={throttle}
                      onChange={e => setThrottle(Number(e.target.value))}
                      className='bg-white border border-indigo-200 rounded px-2 py-1 text-xs font-mono shadow-sm w-28'
                    >
                      <option value={0}>Instant (0ms)</option>
                      <option value={10}>Fast (10ms)</option>
                      <option value={50}>Normal (50ms)</option>
                      <option value={200}>Slow (200ms)</option>
                    </select>
                  </div>

                  <div className='border-t border-indigo-200 pt-3 mt-1'>
                    <div className='flex justify-between items-center mb-2'>
                      <label className='text-[11px] md:text-xs font-bold text-indigo-800'>
                        LR Schedule
                      </label>
                      <select
                        value={lrSchedule}
                        onChange={e => setLrSchedule(e.target.value)}
                        disabled={isTraining}
                        className='bg-white border border-indigo-200 rounded px-2 py-1 text-xs font-mono shadow-sm w-28'
                      >
                        <option value='constant'>Constant</option>
                        <option value='step'>Step Decay</option>
                        <option value='exp'>Exponential</option>
                        <option value='cosine'>Cosine Wave</option>
                      </select>
                    </div>
                    <div className='flex justify-between items-center mb-2'>
                      <label className='text-[11px] md:text-xs font-bold text-indigo-800'>
                        Base LR
                      </label>
                      <select
                        value={baseLr}
                        onChange={e => setBaseLr(Number(e.target.value))}
                        disabled={isTraining}
                        className='bg-white border border-indigo-200 rounded px-2 py-1 text-xs font-mono shadow-sm w-28'
                      >
                        {[
                          0.01, 0.05, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
                          1.0,
                        ].map(lr => (
                          <option key={lr} value={lr}>
                            {lr.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tiny LR Plot */}
                    <div className='w-full h-12 bg-white rounded border border-indigo-100 p-1 relative flex items-center'>
                      <div className='absolute left-2 text-[8px] text-indigo-300 font-mono'>
                        LR: {currentLr.toFixed(4)}
                      </div>
                      {renderLrChart()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Architecture Info */}
              <div className='bg-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm border border-slate-200'>
                {(() => {
                  if (!dataLoaded || !rawData) {
                    return <div className='text-xs text-slate-400 italic py-2'>Loading configuration...</div>;
                  }

                  // Build layer descriptors
                  const numFeatures = rawData.features.length;
                  const parsedBatch = batchSize === 'Full'
                    ? (totalRows ? Math.floor(totalRows * 0.8) : 'N')
                    : parseInt(batchSize, 10);

                  const layerSizes = [...neurons.slice(0, depth), dsConfig.outNeurons];
                  const inputSizes = [numFeatures, ...layerSizes.slice(0, -1)];

                  // Total params
                  let totalParams = 0;
                  layerSizes.forEach((outSize, i) => {
                    totalParams += inputSizes[i] * outSize + outSize; // weights + biases
                  });

                  const toggleLayer = key => {
                    setExpandedLayers(prev => ({ ...prev, [key]: !prev[key] }));
                  };

                  const LayerRow = ({ layerKey, label, inSize, outSize, bgClass, borderClass, textClass, badgeClass }) => {
                    const weights = inSize * outSize;
                    const biases = outSize;
                    const params = weights + biases;
                    const isOpen = !!expandedLayers[layerKey];
                    return (
                      <div className={`rounded border ${borderClass} overflow-hidden`}>
                        <button
                          onClick={() => toggleLayer(layerKey)}
                          className={`w-full flex justify-between items-center text-[10px] md:text-xs ${bgClass} ${textClass} p-1.5 hover:opacity-80 transition-opacity`}
                        >
                          <span className='font-bold flex items-center gap-1'>
                            <span className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} inline-block`}>▶</span>
                            {label}
                          </span>
                          <span className='font-mono flex items-center gap-2'>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${badgeClass}`}>{params.toLocaleString()} params</span>
                            <span>{outSize} neuron{outSize > 1 ? 's' : ''}</span>
                          </span>
                        </button>
                        {isOpen && (
                          <div className={`${bgClass} border-t ${borderClass} px-3 py-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] md:text-[10px] font-mono ${textClass} opacity-90`}>
                            <div><span className='opacity-60'>Weights:</span> <strong>{inSize} × {outSize} = {weights.toLocaleString()}</strong></div>
                            <div><span className='opacity-60'>Biases:</span> <strong>{biases}</strong></div>
                            <div><span className='opacity-60'>Input shape:</span> <strong>({parsedBatch}, {inSize})</strong></div>
                            <div><span className='opacity-60'>Output shape:</span> <strong>({parsedBatch}, {outSize})</strong></div>
                          </div>
                        )}
                      </div>
                    );
                  };

                  return (
                    <div className='flex flex-col gap-1.5'>
                      {/* Header with total params */}
                      <div className='flex justify-between items-center border-b border-slate-100 pb-2 mb-1'>
                        <h2 className='text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide'>Network Architecture</h2>
                        <span className='text-[10px] font-bold bg-slate-800 text-white px-2 py-0.5 rounded-full font-mono'>
                          {totalParams.toLocaleString()} params
                        </span>
                      </div>

                      {/* Input row (not expandable) */}
                      <div className='flex justify-between text-[10px] md:text-xs bg-slate-50 p-1.5 rounded border border-slate-100'>
                        <span className='font-bold text-slate-500'>Features (Input):</span>
                        <span className='font-mono text-slate-700'>{numFeatures} — shape ({parsedBatch}, {numFeatures})</span>
                      </div>

                      {/* Hidden layers */}
                      {[...Array(depth)].map((_, i) => (
                        <LayerRow
                          key={i}
                          layerKey={`hidden_${i}`}
                          label={`Hidden L${i + 1} (ReLU)`}
                          inSize={inputSizes[i]}
                          outSize={layerSizes[i]}
                          bgClass='bg-indigo-50'
                          borderClass='border-indigo-100'
                          textClass='text-indigo-800'
                          badgeClass='bg-indigo-200 text-indigo-900'
                        />
                      ))}

                      {/* Output layer */}
                      <LayerRow
                        layerKey='output'
                        label={`Output (${dsConfig.activation})`}
                        inSize={inputSizes[depth]}
                        outSize={dsConfig.outNeurons}
                        bgClass='bg-purple-50'
                        borderClass='border-purple-100'
                        textClass='text-purple-800'
                        badgeClass='bg-purple-200 text-purple-900'
                      />
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* ========================================== */}
            {/* DATA TABLE (Order 3 inside right column)     */}
            {/* ========================================== */}
            <div className='bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-fit'>
              <div
                className='bg-slate-800 p-2.5 md:p-4 flex justify-between items-center cursor-pointer hover:bg-slate-700 transition-colors'
                onClick={() => setIsTableOpen(!isTableOpen)}
              >
                <h2 className='text-sm md:text-lg font-bold text-white flex items-center gap-2'>
                  <svg
                    className='w-4 h-4 md:w-5 md:h-5 text-blue-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M4 6h16M4 10h16M4 14h16M4 18h16'
                    ></path>
                  </svg>
                  Data Preview & Predictions (20 Samples)
                </h2>
                <div className='text-slate-300 text-[10px] md:text-sm font-semibold'>
                  {isTableOpen ? '▲ Collapse' : '▼ Expand'}
                </div>
              </div>

              {/* Dataset Stats Bar */}
              {dataLoaded && rawData && (
                <div className='bg-slate-700 px-3 md:px-4 py-2 flex flex-col gap-2 text-[10px] md:text-xs font-mono'>
                  {/* Description & Link */}
                  {dsConfig && dsConfig.description && (
                    <div className='text-slate-300 pb-1 md:pb-2 border-b border-slate-600 font-sans leading-relaxed'>
                      <p className='text-[10px] md:text-[13px]'>
                        {dsConfig.description}
                        {dsConfig.sourceUrl && (
                          <a
                            href={dsConfig.sourceUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='ml-2 inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 font-semibold transition-colors'
                          >
                            Source Data
                            <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
                            </svg>
                          </a>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Top Stats */}
                  <div className='flex flex-wrap items-center gap-x-4 gap-y-1 pb-1 md:pb-2 border-b border-slate-600'>
                    <span className='text-slate-300'>
                      <span className='text-slate-500 uppercase tracking-wide font-sans font-bold mr-1'>Size:</span>
                      <span className='text-sky-300'>
                        {dsConfig?.sizeBytes 
                          ? dsConfig.sizeBytes > 1024 * 1024 
                            ? `${(dsConfig.sizeBytes / (1024 * 1024)).toFixed(2)} MB`
                            : `${(dsConfig.sizeBytes / 1024).toFixed(0)} KB`
                          : '???'}
                      </span>
                    </span>
                    <span className='hidden sm:inline text-slate-500'>|</span>
                    <span className='text-slate-300'>
                      <span className='text-slate-500 uppercase tracking-wide font-sans font-bold mr-1'>Total Rows:</span>
                      <span className='text-yellow-300'>{totalRows}</span>
                    </span>
                    <span className='text-slate-500'>|</span>
                    <span className='text-slate-300'>
                      <span className='text-slate-500 uppercase tracking-wide font-sans font-bold mr-1'>Train:</span>
                      <span className='text-blue-300'>{trainRows} rows</span>
                      <span className='text-slate-500 mx-1'>/</span>
                      <span className='text-blue-400'>{trainBatches} batches</span>
                    </span>
                    <span className='text-slate-500'>|</span>
                    <span className='text-slate-300'>
                      <span className='text-slate-500 uppercase tracking-wide font-sans font-bold mr-1'>Test:</span>
                      <span className='text-orange-300'>{testRows} rows</span>
                      <span className='text-slate-500 mx-1'>/</span>
                      <span className='text-orange-400'>{testBatches} batches</span>
                    </span>
                  </div>
                  {/* Full-width Features List */}
                  <div className='flex flex-col sm:flex-row flex-nowrap items-start gap-1 sm:gap-2 w-full'>
                    <span className='text-slate-500 uppercase tracking-wide font-sans font-bold min-w-max mt-0.5'>Features ({rawData.features.length}):</span>
                    <div className='text-emerald-400 break-words leading-relaxed w-full max-h-24 overflow-y-auto custom-scrollbar pr-2 mt-px'>
                      {rawData.features.join(' · ')}
                    </div>
                  </div>
                </div>
              )}

              {isTableOpen && dataSplit && (
                <div className='flex flex-col gap-2 p-2'>
                  {renderPreviewTable('Train', trainIndices, dataSplit.trainX, dataSplit.trainY, predictions.train, isTrainTableOpen, () => setIsTrainTableOpen(!isTrainTableOpen), rollTrainDice)}
                  {renderPreviewTable('Test', testIndices, dataSplit.testX, dataSplit.testY, predictions.test, isTestTableOpen, () => setIsTestTableOpen(!isTestTableOpen), rollTestDice)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* EDUCATIONAL SECTION (Order 4 Mobile, Full)   */}
        {/* ========================================== */}
        <div className='order-4 lg:col-span-12 bg-blue-50 p-4 md:p-8 rounded-2xl md:rounded-3xl border border-blue-100 flex flex-col gap-4 shadow-inner'>
          <h3 className='font-bold text-blue-900 flex items-center gap-2 border-b border-blue-200 pb-2 md:pb-3 text-sm md:text-xl'>
            <svg
              className='w-4 h-4 md:w-6 md:h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              ></path>
            </svg>
            Understanding Overfitting & Hyperparameters
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 text-xs md:text-sm text-blue-900 leading-relaxed'>
            <div className='space-y-3 md:space-y-4'>
              <div className='bg-white p-3 rounded-lg border border-blue-100 shadow-sm'>
                <h4 className='font-bold text-red-600 mb-1'>
                  How to see Overfitting in Action
                </h4>
                <p className='text-slate-700'>
                  To force the network to overfit, select the{' '}
                  <strong>Breast Cancer</strong> or <strong>Iris</strong> dataset. Give
                  the network too much "brain capacity" by selecting{' '}
                  <strong>3 Hidden Layers</strong> with <strong>64 Neurons</strong> each.
                  Set the learning rate to 0.01.
                </p>
                <p className='text-slate-700 mt-2'>
                  Watch the Loss curve closely. The blue line (Training Loss) will
                  continue to drop toward 0. But suddenly, the orange line (Testing Loss)
                  will <strong>U-turn and start rocketing upwards!</strong> The network
                  has stopped learning general patterns and has started blindly memorizing
                  the training data, making it terrible at guessing new test data.
                </p>
              </div>

              <div>
                <h4 className='font-bold mb-1'>Why change the Batch Size?</h4>
                <p>
                  <strong>Full Batch</strong> looks at the entire dataset to calculate a
                  perfectly smooth, accurate gradient step. However, it can easily get
                  stuck in "local minima". Using a small batch like <strong>16</strong>{' '}
                  introduces "noise" to the gradients. The loss curve will look jagged and
                  bouncy, but this chaotic bouncing helps the network shake itself out of
                  bad local minima!
                </p>
              </div>
            </div>

            <div className='space-y-3 md:space-y-4'>
              <div>
                <h4 className='font-bold mb-1'>The Power of Learning Rate Schedules</h4>
                <ul className='list-disc pl-4 md:pl-5 space-y-1.5'>
                  <li>
                    <strong>Constant:</strong> Reliable, but if it's too high, the loss
                    will bounce wildly at the bottom and never settle.
                  </li>
                  <li>
                    <strong>Step / Exponential Decay:</strong> Starts fast to make big
                    leaps, then slows down to carefully "tiptoe" into the deepest part of
                    the minimum without overshooting.
                  </li>
                  <li>
                    <strong>Cosine Annealing:</strong> The LR decays, but then suddenly
                    jumps back up! This is a modern trick used in heavy AI models to
                    intentionally "kick" the network out of a bad spot to find an even
                    better minimum.
                  </li>
                </ul>
              </div>

              <div className='bg-blue-100 p-3 rounded-lg border border-blue-200 mt-2'>
                <h4 className='font-bold mb-1'>Auto MPG & Regression</h4>
                <p>
                  When you select Auto MPG, notice that the metric changes from Accuracy
                  (%) to <strong>Mean Absolute Error (MAE)</strong>. Because we are
                  predicting a continuous number (miles per gallon), we can't be "100%
                  accurate". Instead, we measure how far off our prediction is in absolute
                  units (e.g., an MAE of 2.5 means our guesses are off by 2.5 MPG on
                  average).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


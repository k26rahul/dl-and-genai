import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as tf from '@tensorflow/tfjs';
import {
  METADATA_URL,
  idbGet,
  idbSet,
  shuffleData,
  splitData,
  getScheduledLr,
} from './constants';
import { TrainingChart, LrChart } from './training-charts';
import ControlsBar from './controls-bar';
import ArchitecturePanel from './architecture-panel';
import DataPreviewPanel from './data-preview-panel';

export default function Visualization() {
  // Core state
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [allDatasets, setAllDatasets] = useState({});
  const [metaInfo, setMetaInfo] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [rawData, setRawData] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [cacheHit, setCacheHit] = useState(false);

  // Architecture
  const [depth, setDepth] = useState(2);
  const [neurons, setNeurons] = useState([16, 8, 8]);

  // Hyperparams
  const [batchSize, setBatchSize] = useState('32');
  const [baseLr, setBaseLr] = useState(0.05);
  const [lrSchedule, setLrSchedule] = useState('constant');
  const [throttle, setThrottle] = useState(0);
  const [maxEpochs, setMaxEpochs] = useState(150);

  // Training state
  const [isTraining, setIsTraining] = useState(false);
  const isTrainingRef = useRef(false);
  const [epoch, setEpoch] = useState(0);
  const [history, setHistory] = useState([]);
  const [predictions, setPredictions] = useState({ train: null, test: null });
  const [currentLr, setCurrentLr] = useState(baseLr);
  const modelRef = useRef(null);

  // Data preview
  const [dataSplit, setDataSplit] = useState(null);
  const splitRef = useRef(null);
  const [trainIndices, setTrainIndices] = useState([]);
  const [testIndices, setTestIndices] = useState([]);
  const trainIndicesRef = useRef([]);
  const testIndicesRef = useRef([]);
  const normStatsRef = useRef(null);
  const [isTrainTableOpen, setIsTrainTableOpen] = useState(false);
  const [isTestTableOpen, setIsTestTableOpen] = useState(true);

  // UI
  const [isTableOpen, setIsTableOpen] = useState(false);

  const get10Random = max => {
    if (!max) return [];
    const count = Math.min(10, max);
    const chosen = new Set();
    while (chosen.size < count) chose.add(Math.floor(Math.random() * max));
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
      if (trSelect.length > 0)
        trPred = modelRef.current.predict(tf.tensor2d(trSelect).sub(mean).div(std)).arraySync();
      if (tsSelect.length > 0)
        tsPred = modelRef.current.predict(tf.tensor2d(tsSelect).sub(mean).div(std)).arraySync();
      setPredictions({ train: trPred, test: tsPred });
    });
  };

  const rollTrainDice = e => {
    e.stopPropagation();
    if (!splitRef.current) return;
    const idx = get10Random(splitRef.current.trainX.length);
    setTrainIndices(idx);
    trainIndicesRef.current = idx;
    updatePredictionsForIndices(idx, testIndicesRef.current);
  };

  const rollTestDice = e => {
    e.stopPropagation();
    if (!splitRef.current) return;
    const idx = get10Random(splitRef.current.testX.length);
    setTestIndices(idx);
    testIndicesRef.current = idx;
    updatePredictionsForIndices(trainIndicesRef.current, idx);
  };

  const dsConfig = selectedDataset ? allDatasets[selectedDataset] ?? null : null;

  useEffect(() => {
    if (!isTraining) setCurrentLr(getScheduledLr(epoch, baseLr, lrSchedule));
  }, [baseLr, lrSchedule, epoch, isTraining]);

  const stopTraining = () => {
    setIsTraining(false);
    isTrainingRef.current = false;
  };

  const resetTraining = () => {
    stopTraining();
    setHistory([]);
    setEpoch(0);
    setPredictions({ train: null, test: null });
    setCurrentLr(baseLr);
    if (modelRef.current) { modelRef.current.dispose(); modelRef.current = null; }
  };

  // Metadata loading
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

  // Dataset loading
  useEffect(() => {
    if (!selectedDataset || !metaInfo || !allDatasets[selectedDataset]) return;
    let cancelled = false;
    const dsConf = allDatasets[selectedDataset];
    const cacheKey = `${selectedDataset}__${metaInfo.generatedAt}`;

    setDataLoaded(false);
    setRawData(null);
    setHistory([]);
    setEpoch(0);
    setPredictions({ train: null, test: null });
    setIsTraining(false);
    isTrainingRef.current = false;
    if (modelRef.current) { modelRef.current.dispose(); modelRef.current = null; }
    setCacheHit(false);

    const processData = data => {
      setRawData(data);
      setDataLoaded(true);
      const shuffled = shuffleData(data.X, data.y);
      const split = splitData(shuffled.shuffledX, shuffled.shuffledY, 0.8);
      setDataSplit(split);
      splitRef.current = split;

      const get10 = max => {
        const count = Math.min(10, max);
        const chosen = new Set();
        while (chosen.size < count) chosen.add(Math.floor(Math.random() * max));
        return Array.from(chosen);
      };
      const tIdx = get10(split.trainX.length);
      const tsIdx = get10(split.testX.length);
      setTrainIndices(tIdx);
      setTestIndices(tsIdx);
      trainIndicesRef.current = tIdx;
      testIndicesRef.current = tsIdx;
    };

    async function load() {
      try {
        const cached = await idbGet(cacheKey);
        if (cached && !cancelled) { processData(cached); setCacheHit(true); return; }
      } catch (_) { /* IDB unavailable */ }

      if (cancelled) return;
      setDownloadProgress(-1);

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
        const all = new Uint8Array(received);
        let pos = 0;
        for (const chunk of chunks) { all.set(chunk, pos); pos += chunk.length; }
        const data = JSON.parse(new TextDecoder().decode(all));
        try { await idbSet(cacheKey, data); } catch (_) { /* quota full */ }
        if (!cancelled) processData(data);
      } catch (err) {
        if (!cancelled) console.error('Dataset fetch failed:', err);
      } finally {
        if (!cancelled) setDownloadProgress(null);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [selectedDataset, metaInfo]); // eslint-disable-line react-hooks/exhaustive-deps

  const lrCurve = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= maxEpochs; i++) pts.push(getScheduledLr(i, baseLr, lrSchedule));
    return pts;
  }, [baseLr, lrSchedule, maxEpochs]);

  // Training loop
  const startTraining = async () => {
    if (!dataLoaded || !rawData) return;
    setIsTraining(true);
    isTrainingRef.current = true;
    if (modelRef.current) { modelRef.current.dispose(); modelRef.current = null; }
    setHistory([]);
    setEpoch(0);
    setPredictions({ train: null, test: null });

    const shuffled = shuffleData(rawData.X, rawData.y);
    const { trainX, trainY, testX, testY } = splitData(shuffled.shuffledX, shuffled.shuffledY, 0.8);
    const split = { trainX, trainY, testX, testY };
    setDataSplit(split);
    splitRef.current = split;

    tf.engine().startScope();
    const xTrainRaw = tf.tensor2d(trainX);
    const yTrainRaw = tf.tensor2d(trainY);
    const xTestRaw = tf.tensor2d(testX);
    const yTestRaw = tf.tensor2d(testY);

    const mean = xTrainRaw.mean(0);
    const std = xTrainRaw.squaredDifference(mean).mean(0).sqrt().add(1e-7);
    normStatsRef.current = { mean: mean.arraySync(), std: std.arraySync() };

    const xTrainNorm = xTrainRaw.sub(mean).div(std);
    const xTestNorm = xTestRaw.sub(mean).div(std);

    const model = tf.sequential();
    const numFeatures = rawData.features.length;
    for (let i = 0; i < depth; i++) {
      model.add(tf.layers.dense({
        units: neurons[i],
        activation: 'relu',
        inputShape: i === 0 ? [numFeatures] : undefined,
        kernelInitializer: 'heNormal',
      }));
    }
    model.add(tf.layers.dense({
      units: dsConfig.outNeurons,
      activation: dsConfig.activation,
      kernelInitializer: 'glorotNormal',
    }));
    model.compile({
      optimizer: tf.train.adam(baseLr),
      loss: dsConfig.loss,
      metrics: [dsConfig.metric === 'meanAbsoluteError' ? 'mae' : dsConfig.metric],
    });
    modelRef.current = model;

    const parsedBatchSize = batchSize === 'Full' ? trainX.length : parseInt(batchSize, 10);

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
      const trainLoss = metrics.loss ? metrics.loss[0] : 0;
      const testLoss = metrics.val_loss ? metrics.val_loss[0] : 0;
      const trainMetric = (metrics[dsConfig.metric] || metrics['acc'] || metrics['mae'] || [0])[0];
      const testMetric = (metrics[`val_${dsConfig.metric}`] || metrics['val_acc'] || metrics['val_mae'] || [0])[0];

      setHistory(prev => [...prev, { epoch: e, trainLoss, testLoss, trainMetric, testMetric }]);
      setEpoch(e);

      if ((isTrainTableOpen || isTestTableOpen) && e % 2 === 0) {
        updatePredictionsForIndices(trainIndicesRef.current, testIndicesRef.current);
      }

      if (throttle > 0) {
        await new Promise(r => setTimeout(r, throttle));
      } else {
        await tf.nextFrame();
      }
    }

    updatePredictionsForIndices(trainIndicesRef.current, testIndicesRef.current);
    setIsTraining(false);
    isTrainingRef.current = false;
    tf.engine().endScope();
  };

  const latestMetric = history.length > 0 ? history[history.length - 1] : null;
  const totalRows = rawData ? rawData.X.length : null;
  const trainRows = totalRows ? Math.floor(totalRows * 0.8) : null;
  const testRows = totalRows ? totalRows - trainRows : null;
  const parsedBatchSizeForStats = batchSize === 'Full' ? trainRows : parseInt(batchSize, 10);
  const trainBatches = trainRows && parsedBatchSizeForStats ? Math.ceil(trainRows / parsedBatchSizeForStats) : null;
  const testBatches = testRows && parsedBatchSizeForStats ? Math.ceil(testRows / parsedBatchSizeForStats) : null;

  if (!metaInfo || !dsConfig) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 text-slate-500 py-20'>
        <div className='w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin' />
        <p className='text-sm font-medium'>Loading datasets…</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-2 md:gap-3 lg:gap-4'>
      {/* Controls */}
      <ControlsBar
        isTraining={isTraining}
        dataLoaded={dataLoaded}
        downloadProgress={downloadProgress}
        startTraining={startTraining}
        stopTraining={stopTraining}
        resetTraining={resetTraining}
        selectedDataset={selectedDataset}
        setSelectedDataset={setSelectedDataset}
        allDatasets={allDatasets}
        cacheHit={cacheHit}
        setCacheHit={setCacheHit}
        depth={depth}
        setDepth={setDepth}
        neurons={neurons}
        setNeurons={setNeurons}
        maxEpochs={maxEpochs}
        setMaxEpochs={setMaxEpochs}
        epoch={epoch}
        history={history}
      />

      {/* Main grid */}
      <div className='flex flex-col lg:grid lg:grid-cols-12 gap-2 md:gap-3 lg:gap-4'>
        {/* LEFT: Charts */}
        <div className='order-1 lg:col-span-5 flex flex-col gap-2 md:gap-3 lg:gap-4'>
          {/* Loss Chart */}
          <div className='bg-white p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm border border-slate-200 flex-1 min-h-[200px] flex flex-col'>
            <div className='flex justify-between items-center mb-2'>
              <h2 className='text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest'>
                Loss Curve ({
                  dsConfig.loss === 'binaryCrossentropy' ? 'Binary Cross-Entropy' :
                  dsConfig.loss === 'categoricalCrossentropy' ? 'Categorical Cross-Entropy' :
                  'Mean Squared Error'
                })
              </h2>
              <div className='flex gap-2 text-[9px] md:text-[10px] font-bold'>
                <span className='flex items-center gap-1 text-blue-600'>
                  <div className='w-2 h-2 rounded-full bg-blue-500' /> Train {latestMetric ? `(${latestMetric.trainLoss.toFixed(3)})` : ''}
                </span>
                <span className='flex items-center gap-1 text-orange-500'>
                  <div className='w-2 h-2 rounded-full bg-orange-400' /> Test {latestMetric ? `(${latestMetric.testLoss.toFixed(3)})` : ''}
                </span>
              </div>
            </div>
            <div className='flex-1 w-full bg-slate-50 rounded-lg border border-slate-100 relative h-[160px] lg:h-auto lg:min-h-[130px]'>
              {history.length === 0 ? (
                <div className='absolute inset-0 flex items-center justify-center text-slate-400 text-xs'>
                  Awaiting Training...
                </div>
              ) : (
                <div className='absolute inset-0 p-2'>
                  <TrainingChart history={history} maxEpochs={maxEpochs} dsConfig={dsConfig} type='loss' />
                </div>
              )}
            </div>
          </div>

          {/* Metric Chart */}
          <div className='bg-white p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm border border-slate-200 flex-1 min-h-[200px] flex flex-col'>
            <div className='flex justify-between items-center mb-2'>
              <h2 className='text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest'>
                Performance ({dsConfig.type === 'classification' ? 'Accuracy' : 'Mean Abs Error'})
              </h2>
              <div className='flex gap-2 text-[9px] md:text-[10px] font-bold'>
                <span className='flex items-center gap-1 text-emerald-600'>
                  <div className='w-2 h-2 rounded-full bg-emerald-500' /> Train {latestMetric ? `(${latestMetric.trainMetric.toFixed(3)})` : ''}
                </span>
                <span className='flex items-center gap-1 text-red-500'>
                  <div className='w-2 h-2 rounded-full bg-red-500' /> Test {latestMetric ? `(${latestMetric.testMetric.toFixed(3)})` : ''}
                </span>
              </div>
            </div>
            <div className='flex-1 w-full bg-slate-50 rounded-lg border border-slate-100 relative h-[160px] lg:h-auto lg:min-h-[130px]'>
              {history.length === 0 ? (
                <div className='absolute inset-0 flex items-center justify-center text-slate-400 text-xs'>
                  Awaiting Training...
                </div>
              ) : (
                <div className='absolute inset-0 p-2'>
                  <TrainingChart history={history} maxEpochs={maxEpochs} dsConfig={dsConfig} type='metric' />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Hyperparams + Architecture + Data */}
        <div className='order-2 lg:col-span-7 flex flex-col gap-2 md:gap-3 lg:gap-4'>
          {/* Hyperparams + Architecture side by side */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3'>
            {/* Hyperparameters */}
            <div className='bg-violet-50 p-3 md:p-4 rounded-lg md:rounded-xl shadow-sm border border-violet-100'>
              <h2 className='text-[10px] md:text-xs font-bold text-violet-500 uppercase tracking-widest border-b border-violet-200 pb-2 mb-3'>
                Hyperparameters
              </h2>
              <div className='space-y-2 md:space-y-3'>
                <div className='flex justify-between items-center'>
                  <label className='text-[11px] md:text-xs font-bold text-violet-800'>Batch Size</label>
                  <select
                    value={batchSize}
                    onChange={e => setBatchSize(e.target.value)}
                    disabled={isTraining}
                    className='bg-white border border-violet-200 rounded px-2 py-1 text-xs font-mono shadow-sm w-28'
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
                  <label className='text-[11px] md:text-xs font-bold text-violet-800'>Anim Throttle</label>
                  <select
                    value={throttle}
                    onChange={e => setThrottle(Number(e.target.value))}
                    className='bg-white border border-violet-200 rounded px-2 py-1 text-xs font-mono shadow-sm w-28'
                  >
                    <option value={0}>Instant (0ms)</option>
                    <option value={10}>Fast (10ms)</option>
                    <option value={50}>Normal (50ms)</option>
                    <option value={200}>Slow (200ms)</option>
                  </select>
                </div>

                <div className='border-t border-violet-200 pt-2 space-y-2'>
                  <div className='flex justify-between items-center'>
                    <label className='text-[11px] md:text-xs font-bold text-violet-800'>LR Schedule</label>
                    <select
                      value={lrSchedule}
                      onChange={e => setLrSchedule(e.target.value)}
                      disabled={isTraining}
                      className='bg-white border border-violet-200 rounded px-2 py-1 text-xs font-mono shadow-sm w-28'
                    >
                      <option value='constant'>Constant</option>
                      <option value='step'>Step Decay</option>
                      <option value='exp'>Exponential</option>
                      <option value='cosine'>Cosine Wave</option>
                    </select>
                  </div>
                  <div className='flex justify-between items-center'>
                    <label className='text-[11px] md:text-xs font-bold text-violet-800'>Base LR</label>
                    <select
                      value={baseLr}
                      onChange={e => setBaseLr(Number(e.target.value))}
                      disabled={isTraining}
                      className='bg-white border border-violet-200 rounded px-2 py-1 text-xs font-mono shadow-sm w-28'
                    >
                      {[0.01, 0.05, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(lr => (
                        <option key={lr} value={lr}>{lr.toFixed(2)}</option>
                      ))}
                    </select>
                  </div>
                  <LrChart lrCurve={lrCurve} epoch={epoch} currentLr={currentLr} maxEpochs={maxEpochs} />
                </div>
              </div>
            </div>

            {/* Architecture */}
            <ArchitecturePanel
              rawData={rawData}
              dataLoaded={dataLoaded}
              depth={depth}
              neurons={neurons}
              dsConfig={dsConfig}
              batchSize={batchSize}
              totalRows={totalRows}
            />
          </div>

          {/* Data Preview */}
          <DataPreviewPanel
            dsConfig={dsConfig}
            rawData={rawData}
            isTableOpen={isTableOpen}
            setIsTableOpen={setIsTableOpen}
            dataSplit={dataSplit}
            trainIndices={trainIndices}
            testIndices={testIndices}
            predictions={predictions}
            isTrainTableOpen={isTrainTableOpen}
            setIsTrainTableOpen={setIsTrainTableOpen}
            isTestTableOpen={isTestTableOpen}
            setIsTestTableOpen={setIsTestTableOpen}
            rollTrainDice={rollTrainDice}
            rollTestDice={rollTestDice}
            totalRows={totalRows}
            trainRows={trainRows}
            testRows={testRows}
            trainBatches={trainBatches}
            testBatches={testBatches}
            dataLoaded={dataLoaded}
          />
        </div>
      </div>
    </div>
  );
}

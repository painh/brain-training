import * as tf from '@tensorflow/tfjs';

let model: tf.LayersModel | null = null;
let loadPromise: Promise<void> | null = null;

// Load the TensorFlow.js MNIST model
export async function loadModel(): Promise<void> {
  if (model) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      // Use Vite's BASE_URL for correct path in production
      const basePath = import.meta.env.BASE_URL || '/';
      const modelPath = `${basePath}models/mnist/model.json`;
      model = await tf.loadLayersModel(modelPath);
      console.log('TensorFlow.js MNIST model loaded');
    } catch (error) {
      console.error('Failed to load MNIST model:', error);
      throw error;
    }
  })();

  return loadPromise;
}

// Check if model is ready
export function isModelReady(): boolean {
  return model !== null;
}

// Preprocess canvas to 28x28 grayscale tensor (MNIST-style preprocessing)
function preprocessCanvas(canvas: HTMLCanvasElement): tf.Tensor4D {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Find bounding box and calculate center of mass
  let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
  let hasDrawing = false;
  let totalMass = 0;
  let centerX = 0;
  let centerY = 0;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      const intensity = 255 - imageData.data[i]; // Inverted intensity
      if (intensity > 55) { // Threshold for "ink"
        hasDrawing = true;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        // Accumulate for center of mass
        totalMass += intensity;
        centerX += x * intensity;
        centerY += y * intensity;
      }
    }
  }

  if (!hasDrawing) {
    return tf.zeros([1, 28, 28, 1]);
  }

  // Calculate center of mass
  centerX = centerX / totalMass;
  centerY = centerY / totalMass;

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;

  // MNIST uses 20x20 box with 4px padding on each side
  const targetSize = 20;
  const finalSize = 28;

  // Scale to fit in 20x20 while maintaining aspect ratio
  const scale = targetSize / Math.max(w, h);
  const scaledW = Math.round(w * scale);
  const scaledH = Math.round(h * scale);

  // Create intermediate canvas for scaling
  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = scaledW;
  scaledCanvas.height = scaledH;
  const scaledCtx = scaledCanvas.getContext('2d')!;

  // Use high quality scaling
  scaledCtx.imageSmoothingEnabled = true;
  scaledCtx.imageSmoothingQuality = 'high';

  // Draw the cropped region scaled down
  scaledCtx.drawImage(
    canvas,
    minX, minY, w, h,
    0, 0, scaledW, scaledH
  );

  // Create final 28x28 canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = finalSize;
  tempCanvas.height = finalSize;
  const tempCtx = tempCanvas.getContext('2d')!;

  // Fill with white (MNIST background)
  tempCtx.fillStyle = 'white';
  tempCtx.fillRect(0, 0, finalSize, finalSize);

  // Calculate position to center by center of mass
  // The center of mass should end up at (14, 14) - center of 28x28
  const scaledCenterX = (centerX - minX) * scale;
  const scaledCenterY = (centerY - minY) * scale;
  const offsetX = 14 - scaledCenterX;
  const offsetY = 14 - scaledCenterY;

  // Draw centered by center of mass
  tempCtx.drawImage(scaledCanvas, offsetX, offsetY);

  // Get 28x28 image data and convert to tensor
  const resizedData = tempCtx.getImageData(0, 0, finalSize, finalSize);

  // Convert to grayscale Float32Array (inverted for MNIST: black=1, white=0)
  const input = new Float32Array(finalSize * finalSize);
  for (let i = 0; i < finalSize * finalSize; i++) {
    const gray = resizedData.data[i * 4];
    input[i] = (255 - gray) / 255;
  }

  // Create tensor with shape [1, 28, 28, 1] (batch, height, width, channels)
  return tf.tensor4d(input, [1, 28, 28, 1]);
}

// Digit candidate with score
export interface DigitCandidate {
  digit: number;
  score: number;
}

// Get prediction with confidence
async function predict(tensor: tf.Tensor4D): Promise<{ digit: number; confidence: number; probs: number[] }> {
  if (!model) {
    await loadModel();
    if (!model) return { digit: 0, confidence: 0, probs: [] };
  }

  const prediction = model.predict(tensor) as tf.Tensor;
  const probs = await prediction.data();
  prediction.dispose();

  let maxIdx = 0;
  let maxProb = probs[0];
  for (let i = 1; i < 10; i++) {
    if (probs[i] > maxProb) {
      maxProb = probs[i];
      maxIdx = i;
    }
  }

  return { digit: maxIdx, confidence: maxProb, probs: Array.from(probs) };
}

// Get top N candidates
async function getTopCandidates(tensor: tf.Tensor4D, topN: number = 3): Promise<DigitCandidate[]> {
  const { probs } = await predict(tensor);
  if (probs.length === 0) return [{ digit: 0, score: 1 }];

  const candidates: DigitCandidate[] = probs.map((score, digit) => ({ digit, score }));
  candidates.sort((a, b) => b.score - a.score);

  return candidates.slice(0, topN);
}

// Find digit boundaries by analyzing vertical gaps
function findDigitBoundaries(
  imageData: ImageData,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): { start: number; end: number }[] {
  const width = imageData.width;
  const totalWidth = maxX - minX;
  const height = maxY - minY;

  const colCounts: number[] = [];
  for (let x = minX; x <= maxX; x++) {
    let count = 0;
    for (let y = minY; y <= maxY; y++) {
      const i = (y * width + x) * 4;
      if (imageData.data[i] < 200) count++;
    }
    colCounts.push(count);
  }

  const threshold = Math.max(...colCounts) * 0.05;
  const minGapWidth = Math.max(3, totalWidth * 0.05);
  const minDigitWidth = height * 0.3;

  const rawBoundaries: { start: number; end: number }[] = [];
  let inDigit = false;
  let digitStart = 0;
  let gapStart = -1;

  for (let i = 0; i < colCounts.length; i++) {
    if (!inDigit && colCounts[i] > threshold) {
      inDigit = true;
      digitStart = i;
      gapStart = -1;
    } else if (inDigit && colCounts[i] <= threshold) {
      if (gapStart === -1) {
        gapStart = i;
      }
      if (i - gapStart >= minGapWidth) {
        inDigit = false;
        rawBoundaries.push({ start: minX + digitStart, end: minX + gapStart - 1 });
        gapStart = -1;
      }
    } else if (inDigit && colCounts[i] > threshold) {
      gapStart = -1;
    }
  }

  if (inDigit) {
    rawBoundaries.push({ start: minX + digitStart, end: maxX });
  }

  const boundaries: { start: number; end: number }[] = [];
  for (const bound of rawBoundaries) {
    const boundWidth = bound.end - bound.start;
    if (boundaries.length > 0 && boundWidth < minDigitWidth) {
      boundaries[boundaries.length - 1].end = bound.end;
    } else if (boundWidth < minDigitWidth && rawBoundaries.indexOf(bound) < rawBoundaries.length - 1) {
      continue;
    } else {
      boundaries.push(bound);
    }
  }

  return boundaries;
}

// Preprocess a region of the canvas to tensor (MNIST-style with center of mass)
function preprocessRegion(
  canvas: HTMLCanvasElement,
  regionMinX: number,
  regionMaxX: number,
  regionMinY: number,
  regionMaxY: number
): tf.Tensor4D {
  const ctx = canvas.getContext('2d');
  if (!ctx) return tf.zeros([1, 28, 28, 1]);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Calculate center of mass for the region
  let totalMass = 0;
  let comX = 0;
  let comY = 0;

  for (let y = regionMinY; y <= regionMaxY; y++) {
    for (let x = regionMinX; x <= regionMaxX; x++) {
      const i = (y * canvas.width + x) * 4;
      const intensity = 255 - imageData.data[i];
      if (intensity > 55) {
        totalMass += intensity;
        comX += x * intensity;
        comY += y * intensity;
      }
    }
  }

  if (totalMass === 0) return tf.zeros([1, 28, 28, 1]);

  comX = comX / totalMass;
  comY = comY / totalMass;

  const w = regionMaxX - regionMinX + 1;
  const h = regionMaxY - regionMinY + 1;

  // MNIST uses 20x20 box with 4px padding on each side
  const targetSize = 20;
  const finalSize = 28;

  const scale = targetSize / Math.max(w, h);
  const scaledW = Math.round(w * scale);
  const scaledH = Math.round(h * scale);

  // Create intermediate canvas for scaling
  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = scaledW;
  scaledCanvas.height = scaledH;
  const scaledCtx = scaledCanvas.getContext('2d')!;

  scaledCtx.imageSmoothingEnabled = true;
  scaledCtx.imageSmoothingQuality = 'high';

  scaledCtx.drawImage(
    canvas,
    regionMinX, regionMinY, w, h,
    0, 0, scaledW, scaledH
  );

  // Create final 28x28 canvas
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = finalSize;
  tempCanvas.height = finalSize;
  const tempCtx = tempCanvas.getContext('2d')!;

  tempCtx.fillStyle = 'white';
  tempCtx.fillRect(0, 0, finalSize, finalSize);

  // Center by center of mass
  const scaledCenterX = (comX - regionMinX) * scale;
  const scaledCenterY = (comY - regionMinY) * scale;
  const offsetX = 14 - scaledCenterX;
  const offsetY = 14 - scaledCenterY;

  tempCtx.drawImage(scaledCanvas, offsetX, offsetY);

  const resizedData = tempCtx.getImageData(0, 0, finalSize, finalSize);
  const input = new Float32Array(finalSize * finalSize);
  for (let i = 0; i < finalSize * finalSize; i++) {
    const gray = resizedData.data[i * 4];
    input[i] = (255 - gray) / 255;
  }

  return tf.tensor4d(input, [1, 28, 28, 1]);
}

// Recognize multi-digit number from canvas
export async function recognizeNumber(canvas: HTMLCanvasElement): Promise<number> {
  if (!model) {
    await loadModel();
    if (!model) return 0;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
  let hasDrawing = false;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      if (imageData.data[i] < 200) {
        hasDrawing = true;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!hasDrawing) return 0;

  const w = maxX - minX;
  const h = maxY - minY;
  const aspectRatio = w / h;

  if (aspectRatio < 1.2) {
    const tensor = preprocessCanvas(canvas);
    const { digit } = await predict(tensor);
    tensor.dispose();
    return digit;
  }

  const boundaries = findDigitBoundaries(imageData, minX, maxX, minY, maxY);

  if (boundaries.length === 0) return 0;
  if (boundaries.length === 1) {
    const tensor = preprocessCanvas(canvas);
    const { digit } = await predict(tensor);
    tensor.dispose();
    return digit;
  }

  let result = 0;
  for (const bound of boundaries) {
    const tensor = preprocessRegion(canvas, bound.start, bound.end, minY, maxY);
    const { digit } = await predict(tensor);
    tensor.dispose();
    result = result * 10 + digit;
  }

  return result;
}

// Recognize single digit from canvas
export async function recognizeDigit(canvas: HTMLCanvasElement): Promise<number> {
  if (!model) {
    await loadModel();
    if (!model) {
      console.warn('Model not loaded, falling back to pattern matching');
      return fallbackRecognize(canvas);
    }
  }

  try {
    const tensor = preprocessCanvas(canvas);
    const { digit } = await predict(tensor);
    tensor.dispose();
    return digit;
  } catch (error) {
    console.error('TensorFlow.js inference error:', error);
    return fallbackRecognize(canvas);
  }
}

// Result with confidence scores
export interface RecognitionResult {
  digit: number;
  confidence: number;
  candidates: { digit: number; confidence: number }[];
}

// Recognize and return all possible number combinations
export async function recognizeWithCandidates(
  canvas: HTMLCanvasElement,
  topN: number = 3
): Promise<number[]> {
  if (!model) {
    await loadModel();
    if (!model) return [0];
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return [0];

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
  let hasDrawing = false;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      if (imageData.data[i] < 200) {
        hasDrawing = true;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!hasDrawing) return [0];

  const w = maxX - minX;
  const h = maxY - minY;
  const aspectRatio = w / h;

  if (aspectRatio < 1.2) {
    const tensor = preprocessCanvas(canvas);
    const candidates = await getTopCandidates(tensor, topN);
    tensor.dispose();
    return candidates.map(c => c.digit);
  }

  const boundaries = findDigitBoundaries(imageData, minX, maxX, minY, maxY);

  if (boundaries.length === 0) return [0];
  if (boundaries.length === 1) {
    const tensor = preprocessCanvas(canvas);
    const candidates = await getTopCandidates(tensor, topN);
    tensor.dispose();
    return candidates.map(c => c.digit);
  }

  const digitCandidates: DigitCandidate[][] = [];
  for (const bound of boundaries) {
    const tensor = preprocessRegion(canvas, bound.start, bound.end, minY, maxY);
    const candidates = await getTopCandidates(tensor, topN);
    tensor.dispose();
    digitCandidates.push(candidates);
  }

  const combinations: { number: number; prob: number }[] = [];

  function generateCombinations(
    index: number,
    currentNum: number,
    currentProb: number
  ) {
    if (index === digitCandidates.length) {
      combinations.push({ number: currentNum, prob: currentProb });
      return;
    }
    for (const candidate of digitCandidates[index]) {
      generateCombinations(
        index + 1,
        currentNum * 10 + candidate.digit,
        currentProb * candidate.score
      );
    }
  }

  generateCombinations(0, 0, 1);
  combinations.sort((a, b) => b.prob - a.prob);

  return combinations.map(c => c.number);
}

// Recognize with full confidence information
export async function recognizeWithConfidence(
  canvas: HTMLCanvasElement,
  topN: number = 3
): Promise<RecognitionResult> {
  if (!model) {
    await loadModel();
    if (!model) return { digit: 0, confidence: 0, candidates: [] };
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return { digit: 0, confidence: 0, candidates: [] };

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let hasDrawing = false;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      if (imageData.data[i] < 200) {
        hasDrawing = true;
        break;
      }
    }
    if (hasDrawing) break;
  }

  if (!hasDrawing) return { digit: 0, confidence: 0, candidates: [] };

  const tensor = preprocessCanvas(canvas);
  const candidates = await getTopCandidates(tensor, topN);
  tensor.dispose();

  return {
    digit: candidates[0]?.digit ?? 0,
    confidence: candidates[0]?.score ?? 0,
    candidates: candidates.map(c => ({ digit: c.digit, confidence: c.score })),
  };
}

// Check if any candidate matches the expected answer
export function matchesAnswer(candidates: number[], answer: number): boolean {
  return candidates.includes(answer);
}

// Get all digit probabilities for debugging
export async function getDigitProbabilities(canvas: HTMLCanvasElement): Promise<number[]> {
  if (!model) {
    await loadModel();
    if (!model) return Array(10).fill(0);
  }

  const tensor = preprocessCanvas(canvas);
  const { probs } = await predict(tensor);
  tensor.dispose();
  return probs;
}

// Fast check if the drawn number matches the expected answer
export async function quickCheckAnswer(
  canvas: HTMLCanvasElement,
  expectedAnswer: number
): Promise<{ matches: boolean; recognized: number; confidence: number }> {
  if (!model) {
    await loadModel();
    if (!model) return { matches: false, recognized: 0, confidence: 0 };
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return { matches: false, recognized: 0, confidence: 0 };

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
  let hasDrawing = false;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      if (imageData.data[i] < 200) {
        hasDrawing = true;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!hasDrawing) return { matches: false, recognized: 0, confidence: 0 };

  const w = maxX - minX;
  const h = maxY - minY;
  const aspectRatio = w / h;

  // Single digit
  if (aspectRatio < 1.2) {
    const tensor = preprocessCanvas(canvas);
    const { digit, confidence } = await predict(tensor);
    tensor.dispose();
    return { matches: digit === expectedAnswer, recognized: digit, confidence };
  }

  // Multi-digit
  const recognized = await recognizeNumber(canvas);
  return { matches: recognized === expectedAnswer, recognized, confidence: 0.7 };
}

// Fallback pattern-based recognition
function fallbackRecognize(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let hasDrawing = false;
  let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      if (imageData.data[i] < 200) {
        hasDrawing = true;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (!hasDrawing || minX >= maxX || minY >= maxY) return 0;

  const w = maxX - minX;
  const h = maxY - minY;
  const aspectRatio = w / h;

  if (aspectRatio < 0.4) return 1;
  if (aspectRatio > 1.5) return 7;

  return 0;
}

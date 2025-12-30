import { useRef, useCallback, useEffect, useState } from 'react';
import { loadModel, recognizeWithConfidence } from '../utils/digitRecognizer';
import { useI18nStore } from '../stores/useI18nStore';
import { startDrawingSound, stopDrawingSound } from '../utils/sounds';
import styles from './TwoDigitCanvas.module.css';

interface DigitResult {
  digit: number | null;
  candidates: number[];
  confidence?: number;
}

interface TwoDigitCanvasProps {
  onRecognize?: (result: {
    tens: DigitResult;
    ones: DigitResult;
    combined: number | null;
    combinedCandidates: number[];
  }) => void;
  expectedAnswer?: number;
  onSubmit?: (recognized: number, isCorrect: boolean) => void;
  problemKey?: number;
  showDebugInfo?: boolean;
  autoSubmitDelay?: number;
  singleDigitMode?: boolean; // For sudoku - only show ones digit canvas
  useCandidates?: boolean; // If true, check if expectedAnswer is in candidates list (default: false)
  useInstantSubmitDelay?: boolean; // If true, wait 100ms before submitting correct answer (default: true)
  clearRef?: React.MutableRefObject<(() => void) | null>; // Ref to expose clear function
}

export const TwoDigitCanvas = ({
  onRecognize,
  expectedAnswer,
  onSubmit,
  problemKey,
  showDebugInfo = false,
  autoSubmitDelay = 500,
  singleDigitMode = false,
  useCandidates = false,
  useInstantSubmitDelay = true,
  clearRef,
}: TwoDigitCanvasProps) => {
  const { t } = useI18nStore();
  const tensCanvasRef = useRef<HTMLCanvasElement>(null);
  const onesCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const activeCanvasRef = useRef<'tens' | 'ones' | null>(null);
  const submitTimeoutRef = useRef<number | null>(null);
  const hasSubmittedRef = useRef(false);
  const isMountedRef = useRef(true);

  const [debugInfo, setDebugInfo] = useState<{
    tens: DigitResult;
    ones: DigitResult;
    combined: number | null;
    combinedCandidates: number[];
    confidence?: number;
  } | null>(null);

  const canvasWidth = 100;
  const canvasHeight = 120;

  const clearSingleCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.fillStyle = '#FFFFF8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const clearAllCanvases = useCallback(() => {
    console.log('[TwoDigitCanvas] clearAllCanvases called, isMounted:', isMountedRef.current);
    if (!isMountedRef.current) {
      console.log('[TwoDigitCanvas] Skipping clearAllCanvases - component unmounted');
      return;
    }
    clearSingleCanvas(tensCanvasRef.current);
    clearSingleCanvas(onesCanvasRef.current);
    setDebugInfo(null);
    hasSubmittedRef.current = false;
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }
  }, [clearSingleCanvas]);

  // Track mounted state
  useEffect(() => {
    console.log('[TwoDigitCanvas] Component mounted');
    isMountedRef.current = true;
    return () => {
      console.log('[TwoDigitCanvas] Component unmounting');
      isMountedRef.current = false;
    };
  }, []);

  // Expose clear function via ref
  useEffect(() => {
    if (clearRef) {
      clearRef.current = clearAllCanvases;
    }
    return () => {
      if (clearRef) {
        clearRef.current = null;
      }
    };
  }, [clearRef, clearAllCanvases]);

  // Initialize canvases and load model
  useEffect(() => {
    clearAllCanvases();
    loadModel().catch(console.error);
  }, [clearAllCanvases]);

  // Reset when problem changes
  useEffect(() => {
    clearAllCanvases();
  }, [problemKey, expectedAnswer, clearAllCanvases]);

  // Check if canvas has any drawing
  const hasDrawing = useCallback((canvas: HTMLCanvasElement): boolean => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 200) return true;
    }
    return false;
  }, []);

  // Recognize a single digit from canvas
  const recognizeSingleDigit = useCallback(async (canvas: HTMLCanvasElement): Promise<DigitResult> => {
    if (!hasDrawing(canvas)) {
      return { digit: null, candidates: [], confidence: 0 };
    }
    try {
      const result = await recognizeWithConfidence(canvas, 3);
      return {
        digit: result.digit,
        candidates: result.candidates.map(c => c.digit),
        confidence: result.confidence,
      };
    } catch (e) {
      console.error('Recognition failed:', e);
      return { digit: null, candidates: [], confidence: 0 };
    }
  }, [hasDrawing]);

  // Analyze both canvases and combine results
  const analyze = useCallback(async () => {
    if (hasSubmittedRef.current) return;

    const tensCanvas = tensCanvasRef.current;
    const onesCanvas = onesCanvasRef.current;

    // In single digit mode, only onesCanvas is needed
    if (singleDigitMode) {
      if (!onesCanvas) return;
    } else {
      if (!tensCanvas || !onesCanvas) return;
    }

    const hasTensDrawing = !singleDigitMode && tensCanvas ? hasDrawing(tensCanvas) : false;
    const hasOnesDrawing = onesCanvas ? hasDrawing(onesCanvas) : false;

    if (!hasTensDrawing && !hasOnesDrawing) return;

    const tens = !singleDigitMode && tensCanvas
      ? await recognizeSingleDigit(tensCanvas)
      : { digit: null, candidates: [], confidence: 0 };
    const ones = onesCanvas
      ? await recognizeSingleDigit(onesCanvas)
      : { digit: null, candidates: [], confidence: 0 };

    // Combine results
    let combined: number | null = null;
    let combinedCandidates: number[] = [];
    let confidence: number | undefined;

    if (singleDigitMode) {
      // Single digit mode - only use ones canvas
      combined = ones.digit;
      combinedCandidates = ones.candidates;
      confidence = ones.confidence;
    } else if (hasTensDrawing && hasOnesDrawing) {
      // Both digits - 2-digit number
      if (tens.digit !== null && ones.digit !== null) {
        combined = tens.digit * 10 + ones.digit;
        for (const t of tens.candidates) {
          for (const o of ones.candidates) {
            combinedCandidates.push(t * 10 + o);
          }
        }
        // Combined confidence is product of both
        confidence = (tens.confidence ?? 0) * (ones.confidence ?? 0);
      }
    } else if (hasOnesDrawing && !hasTensDrawing) {
      // Only ones digit - single digit
      combined = ones.digit;
      combinedCandidates = ones.candidates;
      confidence = ones.confidence;
    } else if (hasTensDrawing && !hasOnesDrawing) {
      // Only tens digit - treat as single digit
      combined = tens.digit;
      combinedCandidates = tens.candidates;
      confidence = tens.confidence;
    }

    const result = { tens, ones, combined, combinedCandidates, confidence };

    if (showDebugInfo) {
      setDebugInfo(result);
    }

    onRecognize?.(result);

    // Handle submission with expected answer
    if (expectedAnswer !== undefined && onSubmit && combined !== null) {
      // Cancel any pending timeout
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }

      // Instant submit delay: 100ms if enabled, 0 if disabled
      const instantDelay = useInstantSubmitDelay ? 100 : 0;

      if (useCandidates) {
        // Check if any candidate matches (lenient mode)
        const matches = combinedCandidates.includes(expectedAnswer);

        if (matches && combined === expectedAnswer) {
          // Match with top candidate - submit with optional delay
          submitTimeoutRef.current = window.setTimeout(() => {
            console.log('[TwoDigitCanvas] Instant submit timeout - hasSubmitted:', hasSubmittedRef.current, 'isMounted:', isMountedRef.current);
            if (hasSubmittedRef.current || !isMountedRef.current) return;
            hasSubmittedRef.current = true;
            // Don't call clearAllCanvases here - it will be called when problemKey changes
            onSubmit(expectedAnswer, true);
          }, instantDelay);
        } else {
          // Schedule delayed check
          submitTimeoutRef.current = window.setTimeout(() => {
            console.log('[TwoDigitCanvas] Delayed submit timeout - hasSubmitted:', hasSubmittedRef.current, 'isMounted:', isMountedRef.current);
            if (hasSubmittedRef.current || !isMountedRef.current) return;
            hasSubmittedRef.current = true;

            if (combinedCandidates.includes(expectedAnswer)) {
              onSubmit(expectedAnswer, true);
            } else {
              onSubmit(combined!, false);
            }
          }, autoSubmitDelay);
        }
      } else {
        // Strict mode - only check top recognition result
        const isCorrect = combined === expectedAnswer;
        if (isCorrect) {
          // Correct - submit with optional delay
          submitTimeoutRef.current = window.setTimeout(() => {
            console.log('[TwoDigitCanvas] Strict instant submit - hasSubmitted:', hasSubmittedRef.current, 'isMounted:', isMountedRef.current);
            if (hasSubmittedRef.current || !isMountedRef.current) return;
            hasSubmittedRef.current = true;
            onSubmit(combined, true);
          }, instantDelay);
        } else {
          // Schedule delayed submission
          submitTimeoutRef.current = window.setTimeout(() => {
            console.log('[TwoDigitCanvas] Strict delayed submit - hasSubmitted:', hasSubmittedRef.current, 'isMounted:', isMountedRef.current);
            if (hasSubmittedRef.current || !isMountedRef.current) return;
            hasSubmittedRef.current = true;
            onSubmit(combined!, combined === expectedAnswer);
          }, autoSubmitDelay);
        }
      }
    } else if (onSubmit && combined !== null) {
      // No expected answer (sudoku mode) - submit after delay
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
      submitTimeoutRef.current = window.setTimeout(() => {
        console.log('[TwoDigitCanvas] Sudoku submit - hasSubmitted:', hasSubmittedRef.current, 'isMounted:', isMountedRef.current);
        if (hasSubmittedRef.current || !isMountedRef.current) return;
        hasSubmittedRef.current = true;
        onSubmit(combined!, true);
      }, autoSubmitDelay);
    }

  }, [singleDigitMode, hasDrawing, recognizeSingleDigit, onRecognize, expectedAnswer, onSubmit, showDebugInfo, autoSubmitDelay, useCandidates, useInstantSubmitDelay]);

  const getPosition = useCallback((e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    } else if ('clientX' in e) {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
    return { x: 0, y: 0 };
  }, []);

  const startDrawing = useCallback((e: MouseEvent | TouchEvent, which: 'tens' | 'ones') => {
    e.preventDefault();
    if (hasSubmittedRef.current) return;

    const canvas = which === 'tens' ? tensCanvasRef.current : onesCanvasRef.current;
    if (!canvas) return;

    isDrawingRef.current = true;
    activeCanvasRef.current = which;
    lastPosRef.current = getPosition(e, canvas);

    // Cancel any pending submit
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
      submitTimeoutRef.current = null;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    // Start drawing sound
    startDrawingSound();
  }, [getPosition]);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current || !activeCanvasRef.current) return;

    const canvas = activeCanvasRef.current === 'tens' ? tensCanvasRef.current : onesCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const pos = getPosition(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPosRef.current = pos;
  }, [getPosition]);

  const stopDrawing = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    activeCanvasRef.current = null;

    // Stop drawing sound with fade out
    stopDrawingSound();

    analyze();
  }, [analyze]);

  // Attach event listeners
  useEffect(() => {
    const tensCanvas = tensCanvasRef.current;
    const onesCanvas = onesCanvasRef.current;

    // In single digit mode, only onesCanvas is needed
    if (singleDigitMode) {
      if (!onesCanvas) return;
    } else {
      if (!tensCanvas || !onesCanvas) return;
    }

    const handleTensMouseDown = (e: MouseEvent) => startDrawing(e, 'tens');
    const handleOnesMouseDown = (e: MouseEvent) => startDrawing(e, 'ones');
    const handleMouseMove = (e: MouseEvent) => draw(e);
    const handleMouseUp = () => stopDrawing();

    const handleTensTouchStart = (e: TouchEvent) => startDrawing(e, 'tens');
    const handleOnesTouchStart = (e: TouchEvent) => startDrawing(e, 'ones');
    const handleTouchMove = (e: TouchEvent) => draw(e);
    const handleTouchEnd = () => stopDrawing();

    // Only attach tens canvas listeners if not in single digit mode
    if (!singleDigitMode && tensCanvas) {
      tensCanvas.addEventListener('mousedown', handleTensMouseDown);
      tensCanvas.addEventListener('mousemove', handleMouseMove);
      tensCanvas.addEventListener('mouseup', handleMouseUp);
      tensCanvas.addEventListener('mouseleave', handleMouseUp);
      tensCanvas.addEventListener('touchstart', handleTensTouchStart, { passive: false });
      tensCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      tensCanvas.addEventListener('touchend', handleTouchEnd);
    }

    onesCanvas.addEventListener('mousedown', handleOnesMouseDown);
    onesCanvas.addEventListener('mousemove', handleMouseMove);
    onesCanvas.addEventListener('mouseup', handleMouseUp);
    onesCanvas.addEventListener('mouseleave', handleMouseUp);
    onesCanvas.addEventListener('touchstart', handleOnesTouchStart, { passive: false });
    onesCanvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    onesCanvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      if (!singleDigitMode && tensCanvas) {
        tensCanvas.removeEventListener('mousedown', handleTensMouseDown);
        tensCanvas.removeEventListener('mousemove', handleMouseMove);
        tensCanvas.removeEventListener('mouseup', handleMouseUp);
        tensCanvas.removeEventListener('mouseleave', handleMouseUp);
        tensCanvas.removeEventListener('touchstart', handleTensTouchStart);
        tensCanvas.removeEventListener('touchmove', handleTouchMove);
        tensCanvas.removeEventListener('touchend', handleTouchEnd);
      }

      onesCanvas.removeEventListener('mousedown', handleOnesMouseDown);
      onesCanvas.removeEventListener('mousemove', handleMouseMove);
      onesCanvas.removeEventListener('mouseup', handleMouseUp);
      onesCanvas.removeEventListener('mouseleave', handleMouseUp);
      onesCanvas.removeEventListener('touchstart', handleOnesTouchStart);
      onesCanvas.removeEventListener('touchmove', handleTouchMove);
      onesCanvas.removeEventListener('touchend', handleTouchEnd);

      // Stop any playing sound and reset drawing state when unmounting
      stopDrawingSound();
      isDrawingRef.current = false;
      activeCanvasRef.current = null;

      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, [singleDigitMode, startDrawing, draw, stopDrawing]);

  return (
    <div className={styles.container}>
      <div className={`${styles.canvasWrapper} ${singleDigitMode ? styles.singleMode : ''}`}>
        {!singleDigitMode && (
          <>
            <canvas
              ref={tensCanvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className={styles.canvas}
            />
            <div className={styles.divider} />
          </>
        )}
        <canvas
          ref={onesCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className={styles.canvas}
        />
      </div>

      <div className={styles.controls}>
        <div className={styles.hint}>{t.write_number}</div>
        <button className={styles.clearButton} onClick={clearAllCanvases}>{t.clear}</button>
      </div>

      {showDebugInfo && debugInfo && (
        <div className={styles.debugInfo}>
          <div className={styles.debugResult}>
            {t.recognition}: <strong>{debugInfo.combined ?? '?'}</strong>
            {debugInfo.confidence !== undefined && (
              <span className={styles.confidence}>
                {' '}({(debugInfo.confidence * 100).toFixed(1)}%)
              </span>
            )}
          </div>
          <div className={styles.debugDetails}>
            {t.tens_digit}: {debugInfo.tens.digit ?? '-'} [{debugInfo.tens.candidates.join(', ')}]
            {debugInfo.tens.confidence !== undefined && ` (${(debugInfo.tens.confidence * 100).toFixed(1)}%)`}
          </div>
          <div className={styles.debugDetails}>
            {t.ones_digit}: {debugInfo.ones.digit ?? '-'} [{debugInfo.ones.candidates.join(', ')}]
            {debugInfo.ones.confidence !== undefined && ` (${(debugInfo.ones.confidence * 100).toFixed(1)}%)`}
          </div>
          <div className={styles.debugDetails}>
            {t.candidates}: {debugInfo.combinedCandidates.slice(0, 5).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};

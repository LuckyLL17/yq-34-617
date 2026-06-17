import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Play, Pause, RotateCcw, SkipBack, SkipForward, FastForward, Gauge } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useCopybookStore } from '@/store/useCopybookStore';
import HanziWriter from 'hanzi-writer';

const SPEED_OPTIONS = [
  { label: '慢速', value: 0.5 },
  { label: '正常', value: 1 },
  { label: '快速', value: 2 },
  { label: '极速', value: 5 },
];

export default function StrokeAnimationModal() {
  const { strokeAnimation, closeStrokeAnimation } = useCopybookStore(
    useShallow((s) => ({
      strokeAnimation: s.strokeAnimation,
      closeStrokeAnimation: s.closeStrokeAnimation,
    }))
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [totalStrokes, setTotalStrokes] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const strokeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);
  const pendingStrokeRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const totalStrokesRef = useRef(0);
  const isFirstPlayRef = useRef(true);

  const char = strokeAnimation.char;
  const isOpen = strokeAnimation.isOpen;

  const clearAllTimers = useCallback(() => {
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    if (strokeIntervalRef.current) {
      clearInterval(strokeIntervalRef.current);
      strokeIntervalRef.current = null;
    }
  }, []);

  const renderStrokesUpTo = useCallback(async (target: number): Promise<void> => {
    if (!writerRef.current || totalStrokesRef.current === 0) return;
    const w = writerRef.current as unknown as {
      hideCharacter: () => Promise<void>;
      showCharacter: () => void;
      animateStroke: (i: number, opts?: { onComplete?: () => void }) => Promise<void>;
      _options: { strokeAnimationSpeed: number; delayBetweenStrokes: number };
    };
    const origSpeed = w._options.strokeAnimationSpeed;
    const origDelay = w._options.delayBetweenStrokes;
    w._options.strokeAnimationSpeed = 100;
    w._options.delayBetweenStrokes = 0;
    await w.hideCharacter();
    if (target <= 0) {
      w._options.strokeAnimationSpeed = origSpeed;
      w._options.delayBetweenStrokes = origDelay;
      return;
    }
    for (let idx = 0; idx < target; idx++) {
      if (!writerRef.current) break;
      await w.animateStroke(idx);
    }
    w._options.strokeAnimationSpeed = origSpeed;
    w._options.delayBetweenStrokes = origDelay;
  }, []);

  const animateFromStroke = useCallback(async (startStroke: number) => {
    if (!writerRef.current) {
      console.log('[animateFromStroke] 退出: writerRef 为空');
      return;
    }

    clearAllTimers();
    isAnimatingRef.current = true;
    setIsAnimating(true);
    setIsPaused(false);
    isPausedRef.current = false;

    let strokeIdx = startStroke;
    pendingStrokeRef.current = startStroke;
    setCurrentStroke(startStroke);

    const w = writerRef.current as unknown as {
      animateStroke: (i: number, options?: { onComplete?: () => void }) => Promise<{ canceled: boolean }>;
      hideCharacter: () => Promise<void>;
    };

    if (startStroke === 0) {
      if (isFirstPlayRef.current) {
        isFirstPlayRef.current = false;
      } else {
        await w.hideCharacter();
      }
    } else {
      isFirstPlayRef.current = false;
      await renderStrokesUpTo(startStroke);
    }

    const total = totalStrokesRef.current;
    console.log('[animateFromStroke] 开始循环, startStroke=', startStroke, 'totalStrokes=', total);

    while (writerRef.current && isAnimatingRef.current) {
      if (isPausedRef.current) {
        console.log('[animateFromStroke] 暂停中, strokeIdx=', strokeIdx);
        pendingStrokeRef.current = strokeIdx;
        return;
      }

      if (strokeIdx >= total) {
        console.log('[animateFromStroke] 播放完成');
        isAnimatingRef.current = false;
        setIsAnimating(false);
        if (isLooping) {
          loopTimeoutRef.current = setTimeout(() => {
            animateFromStroke(0);
          }, 500);
        }
        return;
      }

      console.log('[animateFromStroke] 执行 animateStroke(', strokeIdx, ')');
      const t0 = Date.now();
      try {
        const result = await w.animateStroke(strokeIdx);
        console.log('[animateFromStroke] animateStroke 完成, 耗时:', Date.now() - t0, 'ms, result=', result);
        if (result && result.canceled) {
          console.log('[animateFromStroke] animateStroke 被 cancel, 退出循环');
          pendingStrokeRef.current = strokeIdx;
          return;
        }
      } catch (e) {
        console.error('[animateFromStroke] animateStroke 错误:', e);
      }

      if (!writerRef.current || !isAnimatingRef.current || isPausedRef.current) {
        console.log('[animateFromStroke] 中途退出, writer=', !!writerRef.current, 'isAnimating=', isAnimatingRef.current, 'isPaused=', isPausedRef.current);
        pendingStrokeRef.current = strokeIdx;
        return;
      }

      strokeIdx++;
      pendingStrokeRef.current = strokeIdx;
      setCurrentStroke(strokeIdx);
      console.log('[animateFromStroke] 更新到第', strokeIdx, '笔');

      if (strokeIdx < total) {
        await new Promise<void>((resolve) => {
          loopTimeoutRef.current = setTimeout(resolve, 150);
        });
      }
    }
  }, [isLooping, clearAllTimers, renderStrokesUpTo]);

  const initWriter = useCallback(() => {
    if (!containerRef.current || !char || !isOpen) return;

    clearAllTimers();
    isAnimatingRef.current = false;
    isPausedRef.current = false;
    pendingStrokeRef.current = 0;
    isFirstPlayRef.current = true;

    if (writerRef.current) {
      writerRef.current = null;
    }
    containerRef.current.innerHTML = '';
    setError(null);
    setCurrentStroke(0);
    setIsAnimating(false);
    setIsPaused(false);
    setTotalStrokes(0);
    totalStrokesRef.current = 0;

    try {
      const writer = HanziWriter.create(containerRef.current, char, {
        width: 280,
        height: 280,
        padding: 10,
        strokeColor: '#3D2C1F',
        radicalColor: '#8B2E20',
        strokeAnimationSpeed: speed,
        delayBetweenStrokes: 200,
        showOutline: true,
        showCharacter: false,
        charDataLoader: (charToLoad, onComplete, onError) => {
          fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${charToLoad}.json`)
            .then((res) => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return res.json();
            })
            .then((data) => {
              const strokes = data?.strokes?.length || 0;
              setTotalStrokes(strokes);
              totalStrokesRef.current = strokes;
              onComplete(data);
            })
            .catch((err) => {
              onError?.(err);
            });
        },
        onLoadCharDataError: (err) => {
          console.warn('加载笔画数据失败:', err);
          setError('暂无该字的笔画数据');
        },
      });

      writerRef.current = writer;
      (window as any).__hanziWriter = writer;
      (window as any).__hanziContainer = containerRef.current;
    } catch (err) {
      console.error('初始化 HanziWriter 失败:', err);
      setError('初始化失败，请重试');
    }
  }, [char, isOpen, speed, clearAllTimers]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(initWriter, 50);
      return () => {
        clearTimeout(timer);
        clearAllTimers();
      };
    }
  }, [isOpen, initWriter, clearAllTimers]);

  useEffect(() => {
    if (writerRef.current) {
      (writerRef.current as unknown as { _options: { strokeAnimationSpeed: number } })._options.strokeAnimationSpeed = speed;
    }
  }, [speed]);

  useEffect(() => {
    if (totalStrokes > 0) {
      totalStrokesRef.current = totalStrokes;
    }
  }, [totalStrokes]);

  useEffect(() => {
    return () => {
      clearAllTimers();
      isAnimatingRef.current = false;
      isPausedRef.current = false;
    };
  }, [clearAllTimers]);

  const handlePlay = () => {
    if (!writerRef.current || error) return;

    if (isAnimating && isPaused) {
      isPausedRef.current = false;
      setIsPaused(false);
      const continueFrom = pendingStrokeRef.current;
      animateFromStroke(continueFrom);
      return;
    }

    if (isAnimating && !isPaused) {
      isPausedRef.current = true;
      setIsPaused(true);
      return;
    }

    const total = totalStrokesRef.current;
    const startFrom = currentStroke >= total ? 0 : currentStroke;
    animateFromStroke(startFrom);
  };

  const handlePrevStroke = async () => {
    if (!writerRef.current || error) return;
    clearAllTimers();
    isAnimatingRef.current = false;
    isPausedRef.current = false;
    setIsAnimating(false);
    setIsPaused(false);

    const target = Math.max(0, currentStroke - 1);
    setCurrentStroke(target);
    await renderStrokesUpTo(target);
  };

  const handleNextStroke = async () => {
    if (!writerRef.current || error) return;
    clearAllTimers();
    isAnimatingRef.current = false;
    isPausedRef.current = false;
    setIsAnimating(false);
    setIsPaused(false);

    const total = totalStrokesRef.current;
    const target = Math.min(total, currentStroke + 1);
    if (target > 0 && target <= total) {
      const prev = target - 1;
      if (prev > 0) {
        await renderStrokesUpTo(prev);
      } else {
        await renderStrokesUpTo(0);
      }
      setCurrentStroke(target);
      const w = writerRef.current as unknown as {
        animateStroke: (i: number, opts?: { onComplete?: () => void }) => Promise<void>;
      };
      await w.animateStroke(target - 1);
    }
  };

  const handleReset = async () => {
    if (!writerRef.current || error) return;
    clearAllTimers();
    isAnimatingRef.current = false;
    isPausedRef.current = false;
    setIsAnimating(false);
    setIsPaused(false);
    pendingStrokeRef.current = 0;
    await renderStrokesUpTo(0);
    setCurrentStroke(0);
  };

  const handleSpeedChange = async (newSpeed: number) => {
    if (speed === newSpeed) return;
    const wasPlaying = isAnimating && !isPaused;
    const currentPos = isAnimating ? pendingStrokeRef.current : currentStroke;

    clearAllTimers();
    isAnimatingRef.current = false;
    isPausedRef.current = false;
    setIsAnimating(false);
    setIsPaused(false);

    setSpeed(newSpeed);

    setTimeout(async () => {
      if (writerRef.current) {
        const w = writerRef.current as unknown as {
          _options: { strokeAnimationSpeed: number };
        };
        if (w._options) {
          w._options.strokeAnimationSpeed = newSpeed;
        }
      }
      if (wasPlaying && writerRef.current) {
        await animateFromStroke(currentPos);
      }
    }, 80);
  };

  const handleClose = () => {
    clearAllTimers();
    isAnimatingRef.current = false;
    isPausedRef.current = false;
    setIsAnimating(false);
    setIsPaused(false);
    closeStrokeAnimation();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'fadeInUp 0.3s ease-out',
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B2E20] to-[#5d1e15] flex items-center justify-center shadow-lg shadow-[#8B2E20]/20">
              <span className="text-white text-lg font-bold" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                {char}
              </span>
            </div>
            <div>
              <h3
                className="text-lg font-bold text-[#3D2C1F]"
                style={{ fontFamily: '"Noto Serif SC", "STSong", serif' }}
              >
                笔画动画演示
              </h3>
              <p className="text-xs text-stone-500">
                共 {totalStrokes} 笔 · 第 {currentStroke} 笔
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mx-auto bg-gradient-to-br from-amber-50 to-stone-50 rounded-xl border-2 border-stone-200/50 overflow-hidden"
               style={{ width: 300, height: 300 }}>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #D4A574 1px, transparent 1px),
                  linear-gradient(to bottom, #D4A574 1px, transparent 1px)
                `,
                backgroundSize: '50% 50%',
                opacity: 0.3,
              }}
            />
            <svg
              className="absolute inset-0 pointer-events-none"
              width="300"
              height="300"
              viewBox="0 0 300 300"
            >
              <line x1="0" y1="0" x2="300" y2="300" stroke="#D4A574" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
              <line x1="300" y1="0" x2="0" y2="300" stroke="#D4A574" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
            </svg>

            <div
              ref={containerRef}
              id="stroke-writer-container"
              className="absolute inset-0 flex items-center justify-center"
              style={{
                padding: 10,
              }}
            />

            <style>{`
              #stroke-writer-container svg,
              #stroke-writer-container svg * {
                transition: none !important;
                animation: none !important;
              }
            `}</style>

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                  <span className="text-2xl" style={{ fontFamily: '"Noto Serif SC", serif' }}>{char}</span>
                </div>
                <p className="text-sm text-stone-500">{error}</p>
                <p className="text-xs text-stone-400 mt-1">请尝试其他常用汉字</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              onClick={handlePrevStroke}
              disabled={!!error || currentStroke <= 0}
              className="w-11 h-11 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="上一笔"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={handleReset}
              disabled={!!error}
              className="w-11 h-11 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="重置"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={handlePlay}
              disabled={!!error}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                isAnimating && !isPaused
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/30'
                  : 'bg-gradient-to-br from-[#8B2E20] to-[#5d1e15] hover:from-[#7a281c] hover:to-[#4d1912] shadow-[#8B2E20]/30'
              }`}
              title={isAnimating && !isPaused ? '暂停' : '播放'}
            >
              {isAnimating && !isPaused ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
            </button>
            <button
              onClick={handleNextStroke}
              disabled={!!error || currentStroke >= totalStrokes}
              className="w-11 h-11 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="下一笔"
            >
              <SkipForward size={18} />
            </button>
            <button
              onClick={() => setIsLooping(!isLooping)}
              disabled={!!error}
              className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                isLooping
                  ? 'border-[#8B2E20] bg-[#8B2E20]/10 text-[#8B2E20]'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
              }`}
              title={isLooping ? '关闭循环' : '循环播放'}
            >
              <FastForward size={18} />
            </button>
          </div>

          <div className="mt-5 p-4 bg-stone-50 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Gauge size={16} className="text-stone-500" />
              <span className="text-sm font-medium text-stone-700">播放速度</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {SPEED_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSpeedChange(opt.value)}
                  disabled={!!error}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40 ${
                    speed === opt.value
                      ? 'bg-[#8B2E20] text-white shadow-md shadow-[#8B2E20]/20'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {isPaused && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              已暂停
            </div>
          )}

          {isLooping && !isPaused && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#8B2E20]">
              <span className="w-2 h-2 rounded-full bg-[#8B2E20] animate-pulse" />
              循环播放中
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50/50 text-center">
          <p className="text-xs text-stone-500">
            💡 提示：点击字帖中的任意汉字可查看笔画笔顺
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

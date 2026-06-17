import type { GridType, WatermarkConfig } from '@/types';
import { useCopybookStore, COMPLETION_THRESHOLD } from '@/store/useCopybookStore';

interface GridCellProps {
  char: string;
  cellSize: number;
  gridType: GridType;
  gridColor: string;
  fontColor: string;
  fontFamily: string;
  showDashed: boolean;
  showTrace: boolean;
  traceOpacity: number;
  overrideShowTrace?: boolean;
  completion?: number;
  watermark?: WatermarkConfig;
}

export default function GridCell({
  char,
  cellSize,
  gridType,
  gridColor,
  fontColor,
  fontFamily,
  showDashed,
  showTrace,
  traceOpacity,
  overrideShowTrace,
  completion = 0,
  watermark,
}: GridCellProps) {
  const openStrokeAnimation = useCopybookStore((s) => s.openStrokeAnimation);
  const textType = useCopybookStore((s) => s.textType);
  const drawingEnabled = useCopybookStore((s) => s.drawingEnabled);

  const s = cellSize;
  const fontSize = Math.floor(s * 0.78);
  const borderStyle = `1px solid ${gridColor}`;
  const dashedStyle = showDashed
    ? `1px dashed ${gridColor}80`
    : 'none';

  const isEmpty = char === ' ' || char === '' || char === '\u00A0';
  const isChinese = textType === 'chinese';
  const isClickable = !isEmpty && isChinese && /[\u4e00-\u9fa5]/.test(char);
  const isCompleted = drawingEnabled && !isEmpty && completion >= COMPLETION_THRESHOLD;
  const isPartiallyComplete = drawingEnabled && !isEmpty && completion > 0 && completion < COMPLETION_THRESHOLD;

  const handleClick = () => {
    if (isClickable) {
      openStrokeAnimation(char);
    }
  };

  const renderGrid = () => {
    if (gridType === 'none') {
      return null;
    }

    if (gridType === 'tian') {
      return (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ border: borderStyle }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: 0,
              bottom: 0,
              width: 0,
              borderLeft: dashedStyle,
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: 0,
              right: 0,
              height: 0,
              borderTop: dashedStyle,
            }}
          />
        </>
      );
    }

    if (gridType === 'mi') {
      return (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ border: borderStyle }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: 0,
              bottom: 0,
              width: 0,
              borderLeft: dashedStyle,
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: 0,
              right: 0,
              height: 0,
              borderTop: dashedStyle,
            }}
          />
          <svg
            className="absolute inset-0 pointer-events-none"
            width={s}
            height={s}
            viewBox={`0 0 ${s} ${s}`}
            preserveAspectRatio="none"
          >
            {showDashed && (
              <>
                <line
                  x1="0"
                  y1="0"
                  x2={s}
                  y2={s}
                  stroke={`${gridColor}80`}
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <line
                  x1={s}
                  y1="0"
                  x2="0"
                  y2={s}
                  stroke={`${gridColor}80`}
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              </>
            )}
          </svg>
        </>
      );
    }

    if (gridType === 'hui') {
      const inner = s * 0.5;
      const offset = (s - inner) / 2;
      return (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ border: borderStyle }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: offset,
              left: offset,
              width: inner,
              height: inner,
              border: dashedStyle,
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: 0,
              bottom: 0,
              width: 0,
              borderLeft: dashedStyle,
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: 0,
              right: 0,
              height: 0,
              borderTop: dashedStyle,
            }}
          />
        </>
      );
    }

    return null;
  };

  let opacity = 0;
  if (isEmpty) {
    opacity = 0;
  } else if (overrideShowTrace !== undefined) {
    opacity = overrideShowTrace ? traceOpacity : 0;
  } else {
    opacity = showTrace ? traceOpacity : 0;
  }

  return (
    <div
      className={`relative inline-block shrink-0 transition-all duration-200 ${
        isClickable ? 'cursor-pointer group' : ''
      }`}
      style={{
        width: s,
        height: s,
        lineHeight: `${s}px`,
        textAlign: 'center',
      }}
      onClick={handleClick}
    >
      {isCompleted && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-300"
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.18)',
            boxShadow: 'inset 0 0 0 2px rgba(34, 197, 94, 0.5)',
            animation: 'completePulse 0.6s ease-out',
          }}
        />
      )}

      {isPartiallyComplete && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            backgroundColor: `rgba(34, 197, 94, ${completion * 0.12})`,
            boxShadow: `inset 0 0 0 2px rgba(34, 197, 94, ${completion * 0.4})`,
          }}
        />
      )}

      {isCompleted && (
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center pointer-events-none shadow-md z-10"
          style={{ fontSize: 10 }}
        >
          ✓
        </div>
      )}

      {renderGrid()}

      {isClickable && (
        <div
          className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(139, 46, 32, 0.1) 0%, transparent 70%)',
            boxShadow: 'inset 0 0 0 2px rgba(139, 46, 32, 0.3)',
          }}
        />
      )}
      {isClickable && (
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-[#8B2E20] to-[#5d1e15] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-md"
          style={{ fontSize: 9, zIndex: isCompleted ? 20 : 5 }}
        >
          ✎
        </div>
      )}

      <span
        className={`absolute left-0 top-0 block select-none ${
          isClickable ? 'pointer-events-none group-hover:scale-105 group-hover:drop-shadow-sm' : 'pointer-events-none'
        } transition-all duration-150`}
        style={{
          width: s,
          height: s,
          lineHeight: `${s}px`,
          fontFamily,
          fontSize,
          color: fontColor,
          opacity,
          textAlign: 'center',
          textRendering: 'geometricPrecision',
          fontFeatureSettings: '"kern" 0',
          letterSpacing: '0',
          whiteSpace: 'nowrap',
        }}
      >
        {isEmpty ? '' : char}
      </span>

      {watermark && watermark.enabled && watermark.position === 'cell-corner' && watermark.text && (
        <span
          className="absolute right-0.5 bottom-0 pointer-events-none select-none"
          style={{
            fontSize: watermark.fontSize,
            color: watermark.color,
            opacity: watermark.opacity,
            fontFamily: '"Noto Serif SC", "STSong", serif',
            lineHeight: 1,
            zIndex: 2,
          }}
        >
          {watermark.text}
        </span>
      )}
    </div>
  );
}

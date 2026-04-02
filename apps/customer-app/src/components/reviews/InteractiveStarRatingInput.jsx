import React, { useEffect, useMemo, useRef, useState } from 'react';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const StarSvg = ({ filled = 0 }) => {
  const pct = `${Math.round(clamp(filled, 0, 1) * 100)}%`;

  return (
    <span className="relative inline-block w-8 h-8">
      <svg
        viewBox="0 0 20 20"
        className="absolute inset-0 w-8 h-8 text-gray-300 transition-colors duration-200"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>

      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: pct }}
      >
        <svg
          viewBox="0 0 20 20"
          className="absolute inset-0 w-8 h-8 text-yellow-400 transition-colors duration-200"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </span>
    </span>
  );
};

const computeHoverValue = (containerEl, clientX) => {
  if (!containerEl) return 0;
  const rect = containerEl.getBoundingClientRect();
  const x = clamp(clientX - rect.left, 0, rect.width);
  const percent = rect.width > 0 ? x / rect.width : 0;
  const raw = percent * 5;
  return Math.round(raw * 2) / 2;
};

const InteractiveStarRatingInput = ({
  value,
  onChange,
  className = ''
}) => {
  const containerRef = useRef(null);
  const [hoverValue, setHoverValue] = useState(null);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [pop, setPop] = useState(false);

  const displayValue = hoverValue == null ? value : hoverValue;

  const stars = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => {
      const fill = clamp(displayValue - i, 0, 1);
      return { i, fill };
    });
  }, [displayValue]);

  useEffect(() => {
    if (!pop) return;
    const t = setTimeout(() => setPop(false), 180);
    return () => clearTimeout(t);
  }, [pop]);

  useEffect(() => {
    const handlePointerUp = () => {
      if (!isPointerDown) return;
      setIsPointerDown(false);
      setHoverValue(null);
    };

    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [isPointerDown]);

  const handlePointerMove = (e) => {
    const v = computeHoverValue(containerRef.current, e.clientX);
    setHoverValue(v);

    if (isPointerDown) {
      onChange(v);
    }
  };

  const handlePointerLeave = () => {
    if (isPointerDown) return;
    setHoverValue(null);
  };

  const handlePointerDown = (e) => {
    setIsPointerDown(true);
    const v = computeHoverValue(containerRef.current, e.clientX);
    setHoverValue(v);
    onChange(v);
    setPop(true);
  };

  const handleClick = (e) => {
    const v = computeHoverValue(containerRef.current, e.clientX);
    onChange(v);
    setPop(true);
  };

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className={`inline-flex items-center gap-1 select-none cursor-pointer ${pop ? 'scale-105' : 'scale-100'} transition-transform duration-150 ease-out`}
        role="slider"
        aria-label="Rating"
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={value}
        tabIndex={0}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        {stars.map((s) => (
          <StarSvg key={s.i} filled={s.fill} />
        ))}
      </div>
      <div className="mt-1 text-xs text-gray-600">
        {value ? `${value.toFixed(1)} / 5` : 'Select a rating'}
      </div>
    </div>
  );
};

export default InteractiveStarRatingInput;

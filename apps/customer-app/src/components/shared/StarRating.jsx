import React from 'react';

const clamp01 = (n) => Math.max(0, Math.min(1, n));

const Star = ({ fill = 0, size = 20, className = '' }) => {
  const pct = `${Math.round(clamp01(fill) * 100)}%`;

  return (
    <span
      className={`relative inline-block align-middle ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 20 20"
        width={size}
        height={size}
        className="absolute inset-0 text-gray-300"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>

      <span className="absolute inset-0 overflow-hidden" style={{ width: pct }}>
        <svg
          viewBox="0 0 20 20"
          width={size}
          height={size}
          className="absolute inset-0 text-yellow-300"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </span>
    </span>
  );
};

const StarRating = ({ value = 0, outOf = 5, size = 18, className = '', showValue = false }) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const normalized = Math.max(0, Math.min(outOf, safeValue));

  return (
    <div className={`inline-flex items-center ${className}`} aria-label={`${normalized} out of ${outOf} stars`}>
      <div className="inline-flex items-center">
        {Array.from({ length: outOf }).map((_, idx) => {
          const fill = clamp01(normalized - idx);
          return <Star key={idx} fill={fill} size={size} />;
        })}
      </div>
      {showValue && (
        <span className="ml-2 font-bold text-sm sm:text-base text-white">{normalized.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;

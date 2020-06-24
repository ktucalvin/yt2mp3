import React from 'react';

interface ProgressBarProps {
  stripes: boolean;
  percent: number;
}

export default function ProgressBar(props: ProgressBarProps) {
  const { stripes, percent } = props;
  return (
    <div className="progress-bar">
      <div
        className={`progress-value ${stripes ? 'progress-stripes' : ''}`}
        style={{ width: `${percent}%` }}
      >
        <span className="stripes" />
        <div className="percent-text" />
      </div>
    </div>
  );
}

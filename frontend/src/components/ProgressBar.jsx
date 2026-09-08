export default function ProgressBar({
  value = 0,
  color = "accent",
  height = 8,
  showLabel = false,
  style = {},
}) {
  const clampVal = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div style={style}>
      <div className="progress-bar-wrap" style={{ height }}>
        <div
          className={`progress-bar-fill progress-${color}`}
          style={{ width: `${clampVal}%` }}
          role="progressbar"
          aria-valuenow={clampVal}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <div className="text-muted text-xs mt-4" style={{ textAlign: "right", fontWeight: 600 }}>
          {clampVal}%
        </div>
      )}
    </div>
  );
}

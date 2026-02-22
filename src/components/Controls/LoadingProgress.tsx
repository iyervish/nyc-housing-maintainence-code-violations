interface LoadingProgressProps {
  loading: boolean;
  recordCount: number;
  error: string | null;
}

export function LoadingProgress({ loading, recordCount, error }: LoadingProgressProps) {
  if (error) {
    return (
      <div className="loading-bar-container" role="alert" aria-live="assertive">
        <span className="loading-error">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="loading-bar-container" role="status" aria-live="polite">
      {loading && (
        <div
          className="loading-bar"
          role="progressbar"
          aria-label="Loading violations data"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={undefined}
        />
      )}
      <span className="record-count" aria-label={`${recordCount.toLocaleString()} violations loaded`}>
        {recordCount.toLocaleString()} records
        {loading && ' (loading…)'}
      </span>
    </div>
  );
}

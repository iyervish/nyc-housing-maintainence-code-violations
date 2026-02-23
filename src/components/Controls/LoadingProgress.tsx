interface LoadingProgressProps {
  loading: boolean;
  error: string | null;
}

export function LoadingProgress({ loading, error }: LoadingProgressProps) {
  if (error) {
    return (
      <div className="loading-bar-container" role="alert" aria-live="assertive">
        <span className="loading-error">Error: {error}</span>
      </div>
    );
  }

  if (!loading) {
    return null;
  }

  return (
    <div className="loading-bar-container" role="status" aria-live="polite">
      <div
        className="loading-bar"
        role="progressbar"
        aria-label="Loading violations data"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={undefined}
      />
    </div>
  );
}

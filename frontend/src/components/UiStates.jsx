export function Loading({ text = "Loading..." }) {
  return <div className="state-box state-loading">{text}</div>;
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="state-box state-error">
      <p>{message || "Something went wrong."}</p>
      {onRetry && (
        <button className="btn-secondary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message, action }) {
  return (
    <div className="state-box state-empty">
      <p>{message}</p>
      {action}
    </div>
  );
}

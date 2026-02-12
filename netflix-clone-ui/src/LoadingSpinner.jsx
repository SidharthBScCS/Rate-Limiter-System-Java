import "./LoadingSpinner.css";

function LoadingSpinner() {
  return (
    <div className="spinner-container">
      <div className="netflix-spinner">
        <div />
        <div />
        <div />
      </div>
      <div className="spinner-label">
        Loading movies...
        <div className="spinner-subtitle">Preparing your Netflix experience</div>
      </div>
    </div>
  );
}

export default LoadingSpinner;

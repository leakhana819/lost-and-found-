// components/LoadingSpinner.jsx — CampusConnect
import '../styles/components.css';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 20, md: 36, lg: 52 };
  const px = sizes[size] || 36;

  return (
    <div className="spinner-wrapper">
      <svg
        className="spinner-svg"
        style={{ width: px, height: px }}
        viewBox="0 0 50 50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="spinner-track"
          cx="25" cy="25" r="20"
          fill="none"
          strokeWidth="4"
        />
        <circle
          className="spinner-head"
          cx="25" cy="25" r="20"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="page-loader">
      <div className="page-loader-inner">
        <div className="loader-logo">
          <span>C</span>
        </div>
        <LoadingSpinner size="lg" />
        <p className="loader-tagline">Loading CampusConnect…</p>
      </div>
    </div>
  );
}

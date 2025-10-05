import React from 'react';

export default function Alert({ type = 'success', children, onClose }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
      {children}
      {onClose && (
        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
      )}
    </div>
  );
}

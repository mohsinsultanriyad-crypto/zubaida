// Global error handler: send errors to backend
window.onerror = function (message, source, lineno, colno, error) {
  try {
    fetch(`${import.meta.env.VITE_API_BASE}/api/log-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        source,
        lineno,
        colno,
        error: error ? (error.stack || error.toString()) : undefined,
        userAgent: navigator.userAgent,
        time: new Date().toISOString(),
      })
    });
  } catch (e) {
    // fail silently
  }
};
// Safe global shim for legacy db reference (prevents ReferenceError, no-op)
globalThis.db = globalThis.db || {};

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

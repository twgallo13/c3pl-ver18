import './polyfills/networkGuard';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './main.css';
import AppShell from './AppShell';


const rootEl = document.getElementById('root')!;
createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  </React.StrictMode>
);


// Service worker registration with cache-buster
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`/sw.js?v=V18.0.27`);
  });
}

// Remove boot/loading banner if present
const boot = document.getElementById('boot');
if (boot && boot.parentNode) {
  boot.parentNode.removeChild(boot);
}

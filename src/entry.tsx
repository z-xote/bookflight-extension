import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './app/page';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(
    React.createElement(React.StrictMode, null,
      React.createElement(Home)
    )
  );
} else {
  console.error('Root element not found');
}
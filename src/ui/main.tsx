import { createRoot } from 'react-dom/client';
import '@fontsource/literata/400.css';
import '@fontsource/literata/400-italic.css';
import '@fontsource/literata/600.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import './theme.css';
import { App } from './App';

try {
  const t = localStorage.getItem('novel-studio-theme');
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
} catch { /* per-viewer convenience only */ }

createRoot(document.getElementById('root')!).render(<App />);

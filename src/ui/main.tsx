import { createRoot } from 'react-dom/client';
import '@fontsource/literata/400.css';
import '@fontsource/literata/400-italic.css';
import '@fontsource/literata/600.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/libre-caslon-text/400.css';
import '@fontsource/libre-caslon-text/400-italic.css';
import '@fontsource/libre-caslon-text/700.css';
import '@fontsource/libre-caslon-display/400.css';
import '@fontsource/patrick-hand/400.css';
import '@fontsource/just-another-hand/400.css';
import '@fontsource/shadows-into-light-two/400.css';
import './theme.css';
import { App } from './App';
import { BRAND } from '../brand';

document.title = BRAND.name;

try {
  const t = localStorage.getItem('novel-studio-theme');
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
} catch { /* per-viewer convenience only */ }

createRoot(document.getElementById('root')!).render(<App />);

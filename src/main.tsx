import '@fontsource/caveat/400.css';
import '@fontsource/caveat/600.css';
import '@fontsource/caveat/700.css';
import './dls/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
);

import { createRoot } from 'react-dom/client';

import App from "./App";
import { ErrorBoundary } from '@/components/error-boundary';

// FONT AWESOME 6.5.2: OFFLINE VERSION (active).
// Installed from npm; Vite bundles the CSS and webfonts, so no internet is needed.
// (The ONLINE CDN alternative is the commented <link> in index.html. Use one, never both.)
import '@fortawesome/fontawesome-free/css/all.min.css';

// OFFLINE FONTS via Fontsource. These replace the Google Fonts @import that used to be in index.css.
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/playfair-display/500-italic.css'; // for the italic scientific names

// Imported after the libraries above so our own styles can override them.
import './index.css';

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
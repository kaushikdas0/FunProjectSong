import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainScreen from './screens/MainScreen';

// Lazy-import kitchen sink — tree-shaken from production build via import.meta.env.DEV
const KitchenSinkScreen = import.meta.env.DEV
  ? React.lazy(() => import('./screens/KitchenSinkScreen'))
  : null;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        {import.meta.env.DEV && KitchenSinkScreen && (
          <Route
            path="/kitchen-sink"
            element={
              <React.Suspense fallback={null}>
                <KitchenSinkScreen />
              </React.Suspense>
            }
          />
        )}
      </Routes>
    </BrowserRouter>
  );
}

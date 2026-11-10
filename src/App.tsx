import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { BatchPassport } from './pages/BatchPassport';
import { Dashboard } from './pages/Dashboard';
import { Home } from './pages/Home';
import { Standards } from './pages/Standards';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/batch/:id" element={<BatchPassport />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/standards" element={<Standards />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function NotFound() {
  return (
    <section className="space-y-4">
      <h1>Page not found</h1>
      <p>This page does not exist in the ClearThread demo.</p>
      <a href="/">Back to the home page</a>
    </section>
  );
}

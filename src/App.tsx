import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TableSkeleton } from '@/components/ui/Skeleton';

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const CompanyPage = lazy(() => import('@/pages/CompanyPage').then((m) => ({ default: m.CompanyPage })));
const ComparePage = lazy(() => import('@/pages/ComparePage').then((m) => ({ default: m.ComparePage })));
const ReportPage = lazy(() => import('@/pages/ReportPage').then((m) => ({ default: m.ReportPage })));
const DisclosuresPage = lazy(() => import('@/pages/DisclosuresPage').then((m) => ({ default: m.DisclosuresPage })));

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-8"><TableSkeleton /></div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/company/:corpCode" element={<CompanyPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/report/:corpCode" element={<ReportPage />} />
          <Route path="/disclosures" element={<DisclosuresPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

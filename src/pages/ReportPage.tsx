import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReportLayout } from '@/components/reports/ReportLayout';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { analyzeApi } from '@/api/client';
import type { AnalyzeReport } from '@/types';

export function ReportPage() {
  const { corpCode } = useParams<{ corpCode: string }>();
  const [report, setReport] = useState<AnalyzeReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!corpCode) return;
    setLoading(true);
    analyzeApi
      .generate({ corpCode })
      .then(setReport)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [corpCode]);

  return (
    <AppLayout>
      {loading && <TableSkeleton />}
      {error && <p className="text-accent-burgundy">{error}</p>}
      {report && <ReportLayout report={report} />}
    </AppLayout>
  );
}

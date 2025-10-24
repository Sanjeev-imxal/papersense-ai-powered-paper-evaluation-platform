import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '@/lib/store';
import MainLayout from '@/components/layout/MainLayout';

export function HomePage() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}
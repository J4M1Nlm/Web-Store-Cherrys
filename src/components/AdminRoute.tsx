import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import type { User } from '../types';
import { useAuthStore } from '../store/authStore';

export default function AdminRoute() {
  const token = useAuthStore((s) => s.token);

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<User>('/users/me').then((r) => r.data),
    enabled: !!token,
    staleTime: 60_000,
  });

  if (!token) return <Navigate to="/login" replace />;
  if (isLoading) return <div className="min-h-screen gradient-bg flex items-center justify-center"><div className="text-white/40">Loading...</div></div>;
  if (!user || user.role !== 'ADMIN') return <Navigate to="/" replace />;

  return <Outlet />;
}

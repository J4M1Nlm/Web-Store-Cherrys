import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import api from '../lib/axios';
import { jwtDecode } from '../lib/jwt';
import type { AuthResponse } from '../types';
import GlassInput from '../components/ui/GlassInput';
import GlassButton from '../components/ui/GlassButton';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../store/toastStore';

interface JwtPayload {
  sub: string;
  role?: string;
  roles?: string[];
  [key: string]: unknown;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setToken } = useAuthStore();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () =>
      api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
    onSuccess: (data) => {
      setToken(data.token);
      success('Welcome back!');
      const payload = jwtDecode<JwtPayload>(data.token);
      const roles = payload.roles ?? [payload.role].filter(Boolean);
      if (roles.some((r) => r?.toUpperCase() === 'ADMIN')) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Invalid credentials';
      error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { error('Please fill in all fields'); return; }
    mutation.mutate();
  };

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <Heart size={24} className="text-cherry group-hover:scale-110 transition-transform" fill="currentColor" />
            <span className="font-bold text-xl text-white">CherryTwins</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <GlassInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <GlassInput
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-cherry hover:text-cherry/80 transition-colors">
                Forgot password?
              </Link>
            </div>

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={mutation.isPending}
            >
              Sign in
            </GlassButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-cherry hover:text-cherry/80 transition-colors font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

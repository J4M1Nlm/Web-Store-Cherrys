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
import PageTransition from '../components/PageTransition';

interface JwtPayload {
  sub: string;
  role?: string;
  roles?: string[];
  [key: string]: unknown;
}

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setToken } = useAuthStore();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () =>
      api.post<AuthResponse>('/auth/register', { fullName, email, password }).then((r) => r.data),
    onSuccess: (data) => {
      setToken(data.token);
      success('Account created! Welcome to CherryTwins.');
      const payload = jwtDecode<JwtPayload>(data.token);
      const roles = payload.roles ?? [payload.role].filter(Boolean);
      navigate(roles.some((r) => r?.toUpperCase() === 'ADMIN') ? '/admin' : '/');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Registration failed';
      error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) { error('Please fill in all fields'); return; }
    if (password.length < 6) { error('Password must be at least 6 characters'); return; }
    mutation.mutate();
  };

  return (
    <PageTransition>
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <Heart size={24} className="text-cherry group-hover:scale-110 transition-transform" fill="currentColor" />
            <span className="font-bold text-xl text-white">CherryTwins</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-white/40 text-sm mt-1">Join the CherryTwins community</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <GlassInput
              label="Full name"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            <GlassButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={mutation.isPending}
            >
              Create account
            </GlassButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-cherry hover:text-cherry/80 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Heart, CheckCircle } from 'lucide-react';
import api from '../lib/axios';
import GlassInput from '../components/ui/GlassInput';
import GlassButton from '../components/ui/GlassButton';
import { useToast } from '../store/toastStore';
import PageTransition from '../components/PageTransition';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { error } = useToast();

  const mutation = useMutation({
    mutationFn: () => api.post('/auth/password/forgot', { email }).then((r) => r.data),
    onSuccess: () => setSent(true),
    onError: () => error('Failed to send reset email. Please try again.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { error('Please enter your email'); return; }
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
          <h1 className="text-2xl font-bold text-white">Reset password</h1>
          <p className="text-white/40 text-sm mt-1">Enter your email to receive a reset link</p>
        </div>

        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-white mb-2">Check your inbox</h2>
              <p className="text-white/50 text-sm">We sent a password reset link to <span className="text-white">{email}</span></p>
              <Link to="/login" className="block mt-6 text-cherry hover:text-cherry/80 transition-colors text-sm font-medium">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <GlassInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={mutation.isPending}
              >
                Send reset link
              </GlassButton>
              <div className="text-center">
                <Link to="/login" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

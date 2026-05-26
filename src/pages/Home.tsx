import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import api from '../lib/axios';
import type { SpringPage, ProductListItem } from '../types';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import GlassButton from '../components/ui/GlassButton';

const staggerItems = (index: number) => {
  const delays = ['stagger-1','stagger-2','stagger-3','stagger-4','stagger-5','stagger-6','stagger-7','stagger-8'];
  return delays[index] || 'stagger-8';
};

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () =>
      api.get<SpringPage<ProductListItem>>('/catalog/products', { params: { page: 0, size: 10 } }).then((r) => r.data),
  });

  return (
    <div className="gradient-bg min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cherry/10 rounded-full blur-[120px] animate-float-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-900/15 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-cherry/5 rounded-full blur-[100px] animate-spin-slow" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 text-xs font-medium text-cherry animate-fade-in-up">
            <Sparkles size={12} />
            Art meets fashion
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-none tracking-tighter mb-6">
            <span className="text-white">Cherry</span>
            <span className="text-cherry">Twins</span>
            <br />
            <span className="text-white/80 text-3xl sm:text-5xl lg:text-6xl font-light">Shop</span>
          </h1>

          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            Wearable art. Limited editions. Bold statements.
            Explore our curated collection where creativity meets craftsmanship.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/products">
              <GlassButton variant="primary" size="lg">
                Shop Collection
                <ArrowRight size={18} />
              </GlassButton>
            </Link>
            <Link to="/products">
              <GlassButton variant="ghost" size="lg">
                Explore Artists
              </GlassButton>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/20" />
        </div>
      </section>

      {/* Features strip */}
      <section className="border-y border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '\u{1F3A8}', label: 'Original Art' },
              { icon: '\u2726', label: 'Limited Editions' },
              { icon: '\u{1F69A}', label: 'Fast Shipping' },
              { icon: '\u{1F48E}', label: 'Premium Quality' },
            ].map((item, i) => (
              <div key={item.label} className={`flex flex-col items-center gap-2 animate-stagger-${i + 1}`}>
                <span className="text-2xl inline-block hover:scale-125 transition-transform duration-300">{item.icon}</span>
                <span className="text-xs text-white/50 font-medium uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 text-cherry text-xs font-medium uppercase tracking-widest mb-2 animate-fade-in-up">
              <Zap size={12} />
              New arrivals
            </div>
            <h2 className="text-3xl font-bold text-white animate-fade-in-up">Featured Collection</h2>
          </div>
          <Link to="/products" className="group flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
            View all
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {data?.content.map((product, i) => (
              <div key={product.id} className={staggerItems(i)}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="glass-card p-10 text-center relative overflow-hidden card-hover">
          <div className="absolute inset-0 bg-gradient-to-r from-cherry/5 via-transparent to-cherry/5 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-cherry/10 rounded-full blur-[80px] animate-float" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-900/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: '2s' }} />
          <h2 className="text-3xl font-bold text-white mb-3 relative">Ready to stand out?</h2>
          <p className="text-white/50 mb-8 relative">Join thousands of art lovers wearing their identity.</p>
          <Link to="/register">
            <GlassButton variant="primary" size="lg">
              Create an Account
              <ArrowRight size={18} />
            </GlassButton>
          </Link>
        </div>
      </section>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import api from '../lib/axios';
import type { SpringPage, ProductListItem } from '../types';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import GlassButton from '../components/ui/GlassButton';

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
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cherry/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-900/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 text-xs font-medium text-cherry">
            <Sparkles size={12} />
            Art meets fashion
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-none tracking-tighter mb-6">
            <span className="text-white">Cherry</span>
            <span className="text-cherry">Twins</span>
            <br />
            <span className="text-white/80 text-3xl sm:text-5xl lg:text-6xl font-light">Shop</span>
          </h1>

          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10 font-light leading-relaxed">
            Wearable art. Limited editions. Bold statements.
            Explore our curated collection where creativity meets craftsmanship.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              { icon: '🎨', label: 'Original Art' },
              { icon: '✦', label: 'Limited Editions' },
              { icon: '🚚', label: 'Fast Shipping' },
              { icon: '💎', label: 'Premium Quality' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
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
            <div className="flex items-center gap-2 text-cherry text-xs font-medium uppercase tracking-widest mb-2">
              <Zap size={12} />
              New arrivals
            </div>
            <h2 className="text-3xl font-bold text-white">Featured Collection</h2>
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
            {data?.content.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="glass-card p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cherry/5 via-transparent to-cherry/5 pointer-events-none" />
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

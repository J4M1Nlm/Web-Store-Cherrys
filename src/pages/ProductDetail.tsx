import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, ChevronLeft, Minus, Plus } from 'lucide-react';
import api from '../lib/axios';
import type { ProductDetail } from '../types';
import { formatPrice } from '../lib/format';
import { Skeleton } from '../components/ui/Skeleton';
import GlassButton from '../components/ui/GlassButton';
import GlassCard from '../components/ui/GlassCard';
import { useToast } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import type { CartResponse } from '../types';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { success, error } = useToast();
  const { token } = useAuthStore();
  const setCart = useCartStore((s) => s.setCart);
  const qc = useQueryClient();

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.get<ProductDetail>(`/catalog/products/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ variantId, qty }: { variantId: number; qty: number }) =>
      api.post<CartResponse>('/cart/items', { variantId, quantity: qty }).then((r) => r.data),
    onSuccess: (data) => {
      setCart(data);
      qc.invalidateQueries({ queryKey: ['cart'] });
      success('Added to cart!');
    },
    onError: () => error('Failed to add to cart'),
  });

  if (isLoading) return <ProductDetailSkeleton />;
  if (!product) return <div className="min-h-screen gradient-bg flex items-center justify-center text-white/50">Product not found.</div>;

  const filteredVariants = product.variants?.filter((v) => {
    const vAny = v as any;
    return (vAny.active ?? vAny.isActive ?? true) !== false;
  }) ?? [];
  const activeVariants = filteredVariants.length > 0 ? filteredVariants : (product.variants ?? []);

  // Get all unique attribute keys across variants
  const attributeKeys = Array.from(
    new Set(activeVariants.flatMap((v) => Object.keys(v.attributes)))
  );

  // Get unique values for each attribute key
  const attributeOptions: Record<string, string[]> = {};
  for (const key of attributeKeys) {
    attributeOptions[key] = Array.from(new Set(activeVariants.map((v) => v.attributes[key]).filter(Boolean)));
  }

  // Find variant matching selected attributes
  const matchedVariant = activeVariants.find((v) =>
    attributeKeys.every((k) => !selectedAttributes[k] || v.attributes[k] === selectedAttributes[k])
  ) ?? null;

  const displayVariant = activeVariants.find((v) => v.id === selectedVariantId) ?? matchedVariant ?? activeVariants[0] ?? null;
  const price = displayVariant?.priceCents ?? product.basePriceCents;
  const inStock = !displayVariant || displayVariant.stockOnHand > 0;

  const handleSelectAttribute = (key: string, value: string) => {
    const newAttrs = { ...selectedAttributes, [key]: value };
    setSelectedAttributes(newAttrs);
    const matched = activeVariants.find((v) =>
      Object.entries(newAttrs).every(([k, val]) => v.attributes[k] === val)
    );
    if (matched) setSelectedVariantId(matched.id);
  };

  const handleAddToCart = () => {
    if (!token) { error('Please sign in to add items to cart'); return; }
    if (!product?.variants?.length) { error('This product has no variants'); return; }
    const variantId = selectedVariantId ?? activeVariants[0]?.id;
    if (!variantId) { error('Please select a variant'); return; }
    addToCartMutation.mutate({ variantId, qty: quantity });
  };

  return (
    <div className="gradient-bg min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <Link to="/products" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-8">
          <ChevronLeft size={16} />
          Back to shop
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <div className="aspect-square glass-card overflow-hidden">
            {product.images?.[0]?.url ? (
              <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white/10 text-6xl font-bold">CT</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">{product.name}</h1>
              </div>
              <p className="text-3xl font-bold text-cherry mt-3">{formatPrice(price, displayVariant?.currency ?? 'MXN')}</p>
            </div>

            {product.description && (
              <p className="text-white/50 text-sm leading-relaxed">{product.description}</p>
            )}

            {/* Dynamic attribute pickers */}
            {attributeKeys.map((key) => (
              <div key={key}>
                <h3 className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">
                  {key}: <span className="text-white/70 normal-case">{selectedAttributes[key] ?? ''}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {attributeOptions[key].map((val) => {
                    const isSelected = selectedAttributes[key] === val;
                    const variantWithAttr = activeVariants.find((v) => v.attributes[key] === val);
                    const outOfStock = variantWithAttr ? variantWithAttr.stockOnHand === 0 : false;
                    return (
                      <button
                        key={val}
                        onClick={() => handleSelectAttribute(key, val)}
                        disabled={outOfStock}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                          isSelected
                            ? 'bg-cherry text-white border-cherry shadow-[0_0_15px_rgba(232,41,76,0.4)]'
                            : outOfStock
                            ? 'opacity-30 cursor-not-allowed bg-white/5 text-white/40 border-white/10'
                            : 'bg-white/7 text-white/70 border-white/10 hover:bg-white/12 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {val}
                        {outOfStock && <span className="ml-1 text-xs opacity-60">•</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div>
              <h3 className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 glass-card flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white rounded-xl"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-white font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 glass-card flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white rounded-xl"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {!inStock && (
              <GlassCard className="p-3 text-center text-sm text-red-400">
                Out of stock
              </GlassCard>
            )}

            <GlassButton
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              loading={addToCartMutation.isPending}
              disabled={!inStock}
            >
              <ShoppingBag size={18} />
              {inStock ? 'Add to Cart' : 'Out of Stock'}
            </GlassButton>

            {/* Variants list */}
            {activeVariants.length > 0 && (
              <div className="glass-card p-4">
                <h3 className="text-xs font-medium text-white/40 uppercase tracking-widest mb-3">All Variants</h3>
                <div className="space-y-2">
                  {activeVariants.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => { setSelectedVariantId(v.id); setSelectedAttributes(v.attributes); }}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        (selectedVariantId ?? activeVariants[0]?.id) === v.id
                          ? 'bg-cherry/15 border border-cherry/30'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div>
                        <p className="text-sm text-white/80">{v.variantName ?? v.sku}</p>
                        <p className="text-xs text-white/40">{Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-cherry">{formatPrice(v.priceCents, v.currency)}</p>
                        <p className="text-xs text-white/30">{v.stockOnHand} left</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="gradient-bg min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <Skeleton className="h-5 w-32 mb-8" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

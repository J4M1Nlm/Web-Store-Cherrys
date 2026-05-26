import { Link } from 'react-router-dom';
import type { ProductListItem } from '../types';
import { formatPrice } from '../lib/format';

export default function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="glass-card overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(232,41,76,0.25)] group-hover:-translate-y-2 group-hover:border-cherry/30">
        <div className="relative aspect-square overflow-hidden bg-white/5">
          {product.mainImageUrl ? (
            <img
              src={product.mainImageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/20 text-4xl">CT</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="text-xs bg-cherry/80 text-white px-2.5 py-1 rounded-full font-medium">View</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-white/90 line-clamp-2 mb-1.5 group-hover:text-white transition-colors duration-300">
            {product.name}
          </h3>
          <p className="text-cherry font-semibold text-sm group-hover:scale-105 transition-transform duration-300 origin-left">
            {formatPrice(product.basePriceCents, product.currency)}
          </p>
        </div>
      </div>
    </Link>
  );
}

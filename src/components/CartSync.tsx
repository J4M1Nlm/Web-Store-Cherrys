import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import type { CartResponse } from '../types';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export default function CartSync() {
  const token = useAuthStore((s) => s.token);
  const setCart = useCartStore((s) => s.setCart);

  const { data } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get<CartResponse>('/cart').then((r) => r.data),
    enabled: !!token,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (data) setCart(data);
  }, [data, setCart]);

  return null;
}

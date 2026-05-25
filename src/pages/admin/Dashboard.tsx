import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ShoppingBag, Package, DollarSign, Clock, CheckCircle, XCircle, RotateCcw, Layers, Users as Users2, Tag, Box, Star, UserCog } from 'lucide-react';
import api from '../../lib/axios';
import { formatPrice } from '../../lib/format';
import GlassCard from '../../components/ui/GlassCard';

interface StatResponse {
  totalElements: number;
}

interface OrderCount {
  status: string;
  count: number;
}

const COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PAID: '#10b981',
  CANCELLED: '#ef4444',
  REFUNDED: '#a855f7',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

const quickLinks = [
  { to: '/admin/products', label: 'Products', icon: Package, description: 'Manage catalog' },
  { to: '/admin/categories', label: 'Categories', icon: Layers, description: 'Organize products' },
  { to: '/admin/artists', label: 'Artists', icon: Users2, description: 'Manage artists' },
  { to: '/admin/orders', label: 'Orders', icon: Package, description: 'Process orders' },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag, description: 'Create discounts' },
  { to: '/admin/inventory', label: 'Inventory', icon: Box, description: 'Track stock' },
  { to: '/admin/reviews', label: 'Reviews', icon: Star, description: 'Moderate reviews' },
  { to: '/admin/users', label: 'Users', icon: UserCog, description: 'View customers' },
];

const STATUSES = ['PENDING', 'PAID', 'CANCELLED', 'REFUNDED'] as const;

export default function Dashboard() {
  const orderQueries = STATUSES.map((status) =>
    useQuery({
      queryKey: ['admin-orders-count', status],
      queryFn: () => api.get<StatResponse>('/admin/orders', { params: { status, size: 1 } }).then((r) => r.data.totalElements),
    })
  );

  const { data: totalProducts } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: () => api.get<StatResponse>('/admin/catalog/products', { params: { size: 1 } }).then((r) => r.data.totalElements),
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: () => api.get<unknown[]>('/admin/users').then((r) => r.data.length),
  });

  const { data: totalRevenue } = useQuery({
    queryKey: ['admin-total-revenue'],
    queryFn: async () => {
      const res = await api.get<{ content: { status: string; totalCents: number }[] }>('/admin/orders', { params: { size: 1000 } });
      const orders = res.data.content ?? [];
      return orders
        .filter((o) => o.status === 'PAID')
        .reduce((sum, o) => sum + (o.totalCents ?? 0), 0);
    },
  });

  const counts: OrderCount[] = STATUSES.map((status, i) => ({
    status,
    count: orderQueries[i].data ?? 0,
  }));

  const totalOrders = counts.reduce((s, c) => s + c.count, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <Link to="/admin/orders" className="glass-card p-4 hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-cherry/15 rounded-xl flex items-center justify-center group-hover:bg-cherry/25 transition-colors">
              <ShoppingBag size={16} className="text-cherry" />
            </div>
            <span className="text-2xl font-bold text-white">{totalOrders}</span>
          </div>
          <p className="text-xs text-white/40">Total Orders</p>
        </Link>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-blue-500/15 rounded-xl flex items-center justify-center">
              <Package size={16} className="text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-white">{totalProducts ?? '-'}</span>
          </div>
          <p className="text-xs text-white/40">Total Products</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-emerald-500/15 rounded-xl flex items-center justify-center">
              <DollarSign size={16} className="text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-emerald-400">{totalRevenue != null ? formatPrice(totalRevenue, 'MXN') : '-'}</span>
          </div>
          <p className="text-xs text-white/40">Total Revenue</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-purple-500/15 rounded-xl flex items-center justify-center">
              <UserCog size={16} className="text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-white">{users ?? '-'}</span>
          </div>
          <p className="text-xs text-white/40">Total Users</p>
        </div>
      </div>

      {/* Orders Breakdown */}
      <GlassCard className="p-5">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Orders Breakdown</h2>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="w-56 h-56 min-w-[224px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={counts.filter((c) => c.count > 0)}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {counts.filter((c) => c.count > 0).map((entry) => (
                    <Cell key={entry.status} fill={COLORS[entry.status]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value, name) => [value, STATUS_LABELS[String(name)] ?? String(name)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <Link to="/admin/orders?status=PENDING" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Clock size={18} className="text-amber-400" />
              <div>
                <p className="text-xs text-white/40">Pending</p>
                <p className="text-xl font-bold text-amber-400">{counts.find((c) => c.status === 'PENDING')?.count ?? 0}</p>
              </div>
            </Link>
            <Link to="/admin/orders?status=PAID" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <CheckCircle size={18} className="text-emerald-400" />
              <div>
                <p className="text-xs text-white/40">Paid</p>
                <p className="text-xl font-bold text-emerald-400">{counts.find((c) => c.status === 'PAID')?.count ?? 0}</p>
              </div>
            </Link>
            <Link to="/admin/orders?status=CANCELLED" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <XCircle size={18} className="text-red-400" />
              <div>
                <p className="text-xs text-white/40">Cancelled</p>
                <p className="text-xl font-bold text-red-400">{counts.find((c) => c.status === 'CANCELLED')?.count ?? 0}</p>
              </div>
            </Link>
            <Link to="/admin/orders?status=REFUNDED" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <RotateCcw size={18} className="text-purple-400" />
              <div>
                <p className="text-xs text-white/40">Refunded</p>
                <p className="text-xl font-bold text-purple-400">{counts.find((c) => c.status === 'REFUNDED')?.count ?? 0}</p>
              </div>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickLinks.map(({ to, label, icon: Icon, description }) => (
            <Link key={to} to={to}>
              <GlassCard className="p-4 hover:border-white/20 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-cherry/15 rounded-xl flex items-center justify-center group-hover:bg-cherry/25 transition-colors">
                    <Icon size={16} className="text-cherry" />
                  </div>
                  <h3 className="font-medium text-white group-hover:text-cherry transition-colors">{label}</h3>
                </div>
                <p className="text-xs text-white/40">{description}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

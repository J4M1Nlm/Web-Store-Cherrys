import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Package, Layers, Users as Users2, ShoppingBag, Tag, Box, Star, ChevronRight, Menu, LogOut, X, User as UserIcon, UserCog } from 'lucide-react';
import api from '../../lib/axios';
import type { User } from '../../types';
import { useAuthStore } from '../../store/authStore';
import GlassButton from '../../components/ui/GlassButton';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Layers },
  { to: '/admin/artists', label: 'Artists', icon: Users2 },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
  { to: '/admin/inventory', label: 'Inventory', icon: Box },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/users', label: 'Users', icon: UserCog },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuthStore();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<User>('/users/me').then((r) => r.data),
    staleTime: 60_000,
  });

  const handleLogout = () => { logout(); navigate('/login'); };

  const currentPage = navItems.find((n) =>
    n.exact ? pathname === n.to : pathname.startsWith(n.to)
  );

  return (
    <div className="gradient-bg min-h-screen flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-56 glass-card rounded-none border-r border-white/10 flex flex-col transition-transform duration-300
        lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Link to="/admin" className="text-lg font-bold text-white">CherryTwins</Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-cherry/20 text-cherry border border-cherry/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-white/40 hover:text-white transition-colors rounded-xl hover:bg-white/5"
          >
            <ChevronRight size={14} />
            Exit to Store
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="glass-card rounded-none border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-20 bg-black/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Menu size={18} />
            </button>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest">Admin</p>
              <h1 className="text-sm font-semibold text-white">{currentPage?.label ?? 'Dashboard'}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cherry/20 rounded-full flex items-center justify-center">
                <UserIcon size={14} className="text-cherry" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-white">{user?.fullName}</p>
                <p className="text-xs text-white/40">Admin</p>
              </div>
            </div>
            <GlassButton variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </GlassButton>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

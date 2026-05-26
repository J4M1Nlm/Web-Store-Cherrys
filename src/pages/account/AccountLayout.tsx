import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Package, MapPin } from 'lucide-react';
import PageTransition from '../../components/PageTransition';

const navItems = [
  { to: '/account', label: 'Profile', icon: User, exact: true },
  { to: '/account/orders', label: 'Orders', icon: Package },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
];

export default function AccountLayout() {
  const { pathname } = useLocation();

  return (
    <div className="gradient-bg min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex gap-6">
          <aside className="w-48 flex-shrink-0 hidden md:block">
            <nav className="glass-card p-3 space-y-1 sticky top-24">
              {navItems.map(({ to, label, icon: Icon, exact }) => {
                const active = exact ? pathname === to : pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-cherry/20 text-cherry border border-cherry/30'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Mobile nav */}
          <div className="md:hidden w-full mb-4">
            <div className="glass-card p-2 flex gap-1">
              {navItems.map(({ to, label, icon: Icon, exact }) => {
                const active = exact ? pathname === to : pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-xl text-xs font-medium transition-all ${
                      active ? 'bg-cherry/20 text-cherry' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          <main className="flex-1 min-w-0">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { token, logout } = useAuthStore();
  const itemsCount = useCartStore((s) => s.itemsCount);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <Heart size={20} className="text-cherry group-hover:scale-110 transition-transform duration-300" fill="currentColor" />
            <span className="font-bold text-lg tracking-tight text-white">CherryTwins</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/products">Shop</NavLink>
            {token ? (
              <>
                <NavLink to="/account">Account</NavLink>
                <button onClick={handleLogout} className="text-sm text-white/60 hover:text-white transition-colors">
                  Sign out
                </button>
              </>
            ) : (
              <NavLink to="/login">Sign in</NavLink>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="relative p-2 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white"
            >
              <ShoppingBag size={20} />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cherry text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(232,41,76,0.6)] animate-scale-in">
                  {itemsCount > 99 ? '99+' : itemsCount}
                </span>
              )}
            </Link>

            {token && (
              <Link to="/account" className="hidden md:flex p-2 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white">
                <User size={20} />
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white"
            >
              {menuOpen ? <X size={20} className="animate-scale-in" /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-black/90 backdrop-blur-xl border-t border-white/10 py-4">
          <div className="max-w-7xl mx-auto px-4 flex flex-col gap-1">
            <MobileNavLink to="/products" delay="stagger-1">Shop</MobileNavLink>
            {token ? (
              <>
                <div className={menuOpen ? 'animate-stagger-2' : ''}>
                  <MobileNavLink to="/account">Account</MobileNavLink>
                </div>
                <div className={menuOpen ? 'animate-stagger-3' : ''}>
                  <MobileNavLink to="/account/orders">Orders</MobileNavLink>
                </div>
                <div className={menuOpen ? 'animate-stagger-4' : ''}>
                  <button onClick={handleLogout} className="text-left px-3 py-2.5 text-white/60 hover:text-white transition-colors text-sm w-full">
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className={menuOpen ? 'animate-stagger-2' : ''}>
                  <MobileNavLink to="/login">Sign in</MobileNavLink>
                </div>
                <div className={menuOpen ? 'animate-stagger-3' : ''}>
                  <MobileNavLink to="/register">Create account</MobileNavLink>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors relative group ${active ? 'text-white' : 'text-white/70 hover:text-white'}`}
    >
      {children}
      <span className={`absolute -bottom-0.5 left-0 h-px bg-cherry transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
    </Link>
  );
}

function MobileNavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="px-3 py-2.5 text-sm text-white/70 hover:text-white transition-colors hover:bg-white/5 rounded-lg">
      {children}
    </Link>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NavBar from './components/NavBar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import ToastContainer from './components/ui/Toast';
import CartSync from './components/CartSync';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import AccountLayout from './pages/account/AccountLayout';
import Profile from './pages/account/Profile';
import Orders from './pages/account/Orders';
import OrderDetail from './pages/account/OrderDetail';
import Addresses from './pages/account/Addresses';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductList from './pages/admin/ProductList';
import ProductForm from './pages/admin/ProductForm';
import ProductVariants from './pages/admin/ProductVariants';
import ProductImages from './pages/admin/ProductImages';
import CategoryList from './pages/admin/CategoryList';
import CategoryForm from './pages/admin/CategoryForm';
import ArtistList from './pages/admin/ArtistList';
import ArtistForm from './pages/admin/ArtistForm';
import AdminOrderList from './pages/admin/AdminOrderList';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import CouponList from './pages/admin/CouponList';
import CouponForm from './pages/admin/CouponForm';
import InventorySearch from './pages/admin/InventorySearch';
import ReviewList from './pages/admin/ReviewList';
import UserList from './pages/admin/UserList';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CartSync />
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<PrivateRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<Profile />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:orderId" element={<OrderDetail />} />
              <Route path="addresses" element={<Addresses />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="products/:id/variants" element={<ProductVariants />} />
              <Route path="products/:id/images" element={<ProductImages />} />
              <Route path="categories" element={<CategoryList />} />
              <Route path="categories/new" element={<CategoryForm />} />
              <Route path="categories/:id/edit" element={<CategoryForm />} />
              <Route path="artists" element={<ArtistList />} />
              <Route path="artists/new" element={<ArtistForm />} />
              <Route path="artists/:id/edit" element={<ArtistForm />} />
              <Route path="orders" element={<AdminOrderList />} />
              <Route path="orders/:orderId" element={<AdminOrderDetail />} />
              <Route path="coupons" element={<CouponList />} />
              <Route path="coupons/new" element={<CouponForm />} />
              <Route path="coupons/:id/edit" element={<CouponForm />} />
              <Route path="inventory" element={<InventorySearch />} />
              <Route path="reviews" element={<ReviewList />} />
              <Route path="users" element={<UserList />} />
            </Route>
          </Route>
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUserList from './pages/admin/UserList';
import AdminStoreList from './pages/admin/StoreList';
import AddUser from './pages/admin/AddUser';
import AddStore from './pages/admin/AddStore';
import UserDetail from './pages/admin/UserDetail';

import UserStoreList from './pages/user/StoreList';

import OwnerDashboard from './pages/owner/Dashboard';

function AppRoutes() {
  const { auth, isAuthenticated } = useAuth();

  // determine default redirect for authenticated users
  function getDefaultRoute(): string {
    if (!auth.user) return '/login';
    switch (auth.user.role) {
      case 'admin': return '/admin/dashboard';
      case 'owner': return '/owner/dashboard';
      default: return '/user/stores';
    }
  }

  return (
    <Routes>
      {/* public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Signup />}
      />

      {/* admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Navbar />
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Navbar />
          <AdminUserList />
        </ProtectedRoute>
      } />
      <Route path="/admin/users/add" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Navbar />
          <AddUser />
        </ProtectedRoute>
      } />
      <Route path="/admin/users/:id" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Navbar />
          <UserDetail />
        </ProtectedRoute>
      } />
      <Route path="/admin/stores" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Navbar />
          <AdminStoreList />
        </ProtectedRoute>
      } />
      <Route path="/admin/stores/add" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Navbar />
          <AddStore />
        </ProtectedRoute>
      } />

      {/* normal user routes */}
      <Route path="/user/stores" element={
        <ProtectedRoute allowedRoles={['user']}>
          <Navbar />
          <UserStoreList />
        </ProtectedRoute>
      } />

      {/* store owner routes */}
      <Route path="/owner/dashboard" element={
        <ProtectedRoute allowedRoles={['owner']}>
          <Navbar />
          <OwnerDashboard />
        </ProtectedRoute>
      } />

      {/* catch-all */}
      <Route path="*" element={
        <Navigate to={isAuthenticated ? getDefaultRoute() : '/login'} replace />
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-layout">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import PasswordModal from './PasswordModal';

export default function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [showPwdModal, setShowPwdModal] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // figure out the home path based on role
  function getHomePath(): string {
    switch (auth.user?.role) {
      case 'admin': return '/admin/dashboard';
      case 'owner': return '/owner/dashboard';
      default: return '/user/stores';
    }
  }

  if (!auth.user) return null;

  return (
    <>
      <nav className="navbar">
        <Link to={getHomePath()} className="navbar-brand">
          RateMatrix
        </Link>

        <div className="navbar-right">
          <div className="navbar-user">
            <span className="navbar-user-name">{auth.user.name}</span>
            <span className={`role-badge ${auth.user.role}`}>
              {auth.user.role}
            </span>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowPwdModal(true)}
          >
            Change Password
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {showPwdModal && (
        <PasswordModal onClose={() => setShowPwdModal(false)} />
      )}
    </>
  );
}

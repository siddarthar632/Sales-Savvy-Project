import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import useravatar from './useravatar.png';
import './assets/styles.css';

export function ProfileDropdown({ username }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, role } = useAuth();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="profile-dropdown" style={{ position: 'relative' }}>
      <button className="profile-button" onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
        <img
          src={useravatar}
          alt="User Avatar"
          className="user-avatar"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=U'; }}
        />
        <span className="username">{username || 'User'}</span>
      </button>
      {isOpen && (
        <div className="dropdown-menu" style={{ position: 'absolute', right: 0, zIndex: 100, background: '#fff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderRadius: '8px', padding: '8px 0', minWidth: '150px' }}>
          <div style={{ padding: '8px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '12px', color: '#6b7280' }}>
            Role: <strong>{role || 'CUSTOMER'}</strong>
          </div>
          <Link to="/orders" style={{ display: 'block', padding: '8px 16px', textDecoration: 'none', color: '#374151' }}>
            My Orders
          </Link>
          <Link to="/UserCartPage" style={{ display: 'block', padding: '8px 16px', textDecoration: 'none', color: '#374151' }}>
            My Cart
          </Link>
          {role === 'ADMIN' && (
            <Link to="/admindashboard" style={{ display: 'block', padding: '8px 16px', textDecoration: 'none', color: '#6366f1', fontWeight: 600 }}>
              Admin Panel
            </Link>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              borderTop: '1px solid #f3f4f6',
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { CartIcon } from './CartIcon';
import { ProfileDropdown } from './ProfileDropdown';
import Logo from './Logo';
import './assets/styles.css';

export function Header({ cartCount, username, searchQuery, onSearchChange }) {
  return (
    <header className="header">
      <div className="header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Link to="/customerhome" style={{ textDecoration: 'none' }}>
          <Logo />
        </Link>

        {onSearchChange && (
          <div className="search-container" style={{ flex: '0 1 400px', margin: '0 20px' }}>
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid #d1d5db',
                outline: 'none',
                fontSize: '14px',
              }}
            />
          </div>
        )}

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <CartIcon count={cartCount} />
          {username && username !== 'Guest' ? (
            <ProfileDropdown username={username} />
          ) : (
            <Link to="/" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiSettings } from 'react-icons/fi';
import '../styles/Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>💬 Chat App</h1>
        </div>
        
        <div className="header-right">
          <div className="user-menu">
            <button
              className="user-button"
              onClick={() => setShowMenu(!showMenu)}
            >
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user?.username}</span>
            </button>
            
            {showMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-item">
                  <FiSettings /> Settings
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <FiLogOut /> Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


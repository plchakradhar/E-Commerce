import React from 'react';
import {
  FaTimes,
  FaShoppingBag,
  FaInfoCircle,
  FaEnvelope,
  FaHome,
  FaUser,
  FaHeart,
  FaShoppingCart,
  FaCog,
  FaSignOutAlt,
  FaQuestionCircle
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/components/Sidebar.css';

const Sidebar = ({
  isOpen,
  onClose,
  showHome = true,
  userLoggedIn = false,
  currentUser = null,
  onLoginClick = () => { },
  onLogout = () => { },


  cartItemsCount = 0,
  wishlistItemsCount = 0
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainMenuItems = [
    ...(showHome ? [{ icon: FaHome, label: 'Home', path: '/' }] : []),
    { icon: FaShoppingBag, label: 'Shop All', path: '/products' },
    { icon: FaShoppingBag, label: 'Men', path: '/products?category=men' },
    { icon: FaShoppingBag, label: 'Women', path: '/products?category=women' },
    { icon: FaShoppingBag, label: 'Accessories', path: '/products?category=accessories' },
  ];

  const accountMenuItems = userLoggedIn ? [
    { icon: FaUser, label: 'My Profile', path: '/profile' },
    { icon: FaShoppingBag, label: 'My Orders', path: '/orders' },
    { icon: FaHeart, label: 'Wishlist', path: '/wishlist', badge: wishlistItemsCount },
    { icon: FaShoppingCart, label: 'Cart', path: '/cart', badge: cartItemsCount },
    { icon: FaCog, label: 'Settings', path: '/settings' },
  ] : [];

  const supportMenuItems = [
    { icon: FaInfoCircle, label: 'About Us', path: '/about' },
    { icon: FaQuestionCircle, label: 'FAQ', path: '/faq' },
    { icon: FaEnvelope, label: 'Contact', path: '/contact' },
  ];

  const handleItemClick = (item) => {
    if (item.path.startsWith('/')) {
      navigate(item.path);
    } else if (item.action) {
      item.action();
    }
    onClose();
  };

  const handleAuthClick = () => {
    onLoginClick();
    onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <h3>Mascle</h3>
            <p>Your Style Journey</p>
          </div>
          <button className="sidebar-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* User Info Section */}
        {userLoggedIn && currentUser ? (
          <div className="user-section">
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-info">
              <h4>{currentUser.fullName || currentUser.username}</h4>
              <p>{currentUser.email}</p>
            </div>
          </div>
        ) : (
          <div className="auth-section">
            <p>Welcome to Mascle</p>
            <button className="auth-btn" onClick={handleAuthClick}>
              Sign In / Register
            </button>
          </div>
        )}

        <div className="sidebar-content">
          {/* Main Navigation */}
          <div className="sidebar-section">
            <h4 className="section-title">Shop</h4>
            <div className="sidebar-menu">
              {mainMenuItems.map((item, index) => (
                <button
                  key={index}
                  className={`sidebar-item ${isActivePath(item.path) ? 'active' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <item.icon className="sidebar-icon" />
                  <span className="sidebar-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account Navigation */}
          {userLoggedIn && (
            <div className="sidebar-section">
              <h4 className="section-title">My Account</h4>
              <div className="sidebar-menu">
                {accountMenuItems.map((item, index) => (
                  <button
                    key={index}
                    className={`sidebar-item ${isActivePath(item.path) ? 'active' : ''}`}
                    onClick={() => handleItemClick(item)}
                  >
                    <item.icon className="sidebar-icon" />
                    <span className="sidebar-label">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="sidebar-badge">{item.badge}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Support Navigation */}
          <div className="sidebar-section">
            <h4 className="section-title">Support</h4>
            <div className="sidebar-menu">
              {supportMenuItems.map((item, index) => (
                <button
                  key={index}
                  className={`sidebar-item ${isActivePath(item.path) ? 'active' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <item.icon className="sidebar-icon" />
                  <span className="sidebar-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Logout Button */}
          {userLoggedIn && (
            <div className="sidebar-section">
              <button className="sidebar-item logout-btn" onClick={handleLogoutClick}>
                <FaSignOutAlt className="sidebar-icon" />
                <span className="sidebar-label">Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <p>&copy; 2025 Mascle</p>
          <p>Style for the Conscious Generation</p>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
    </>
  );
};

export default Sidebar;
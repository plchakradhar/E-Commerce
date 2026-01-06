import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import {
    FaSearch,
    FaUser,
    FaUserCircle,
    FaHeart,
    FaShoppingCart,
    FaCoins,
    FaSignOutAlt,
    FaShoppingBag,
    FaBars,
    FaTimes
} from 'react-icons/fa';
import Mascle from '../../assets/Mascle_logo.png';
import '../../styles/components/Header.css';

import CoinsDrawer from '../features/CoinsDrawer';

const Header = ({
    userLoggedIn,
    currentUser,
    searchQuery,
    setSearchQuery,
    onSearch,
    onLogout,
    onLoginClick,
    onWishlistClick,
    onCartClick,
    cartItemsCount = 0,
    wishlistItemsCount = 0
}) => {
    const navigate = useNavigate();
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [showCoinsDrawer, setShowCoinsDrawer] = useState(false);
    const dropdownRef = React.useRef(null);
    const userMenuRef = React.useRef(null);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle click outside for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen &&
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(e);
        } else if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
        setShowMobileSearch(false);
    };

    const handleLogoClick = () => {
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleMyOrdersClick = () => {
        navigate('/orders');
        setIsDropdownOpen(false);
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setIsDropdownOpen(false);
    };

    const handleLogout = () => {
        onLogout();
        setIsDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <>
            <header className={`header ${scrolled ? 'scrolled' : ''}`}>
                <div className="header-container">
                    {/* Mobile Search Overlay */}
                    {showMobileSearch && (
                        <div className="mobile-search-overlay">
                            <form onSubmit={handleSearch} className="mobile-search-form">
                                <FaSearch className="mobile-search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="mobile-search-input"
                                    autoFocus
                                />
                            </form>
                            <button
                                type="button"
                                className="mobile-search-close"
                                onClick={() => setShowMobileSearch(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    {/* Standard Header Content (Hidden when mobile search is active on small screens? -> CSS handles z-index, logic here just overlays) */}

                    {/* Left Section - Logo */}
                    <div className="header-left">
                        <div className="logo" onClick={handleLogoClick}>
                            <img src={Mascle} alt="Mascle" />
                        </div>
                    </div>

                    {/* Center Section - Search Bar (Desktop) */}
                    <div className="header-center">
                        <form
                            className={`search-bar ${isSearchFocused ? 'focused' : ''}`}
                            onSubmit={handleSearch}
                        >
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search for products, brands and more..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className="search-input"
                            />
                        </form>
                    </div>

                    {/* Right Section - Navigation Icons */}
                    <div className="header-right">
                        {/* Mobile Search Trigger */}
                        <button
                            className="mobile-search-trigger"
                            onClick={() => setShowMobileSearch(true)}
                        >
                            <FaSearch />
                        </button>

                        {/* Coins Display */}
                        {userLoggedIn && (
                            <button
                                className="nav-item coins-btn"
                                onClick={() => setShowCoinsDrawer(true)}
                                title="My Coins"
                            >
                                <FaCoins className="nav-icon coins-icon" />
                                <span className="coins-count">{currentUser?.coins || 0}</span>
                            </button>
                        )}

                        {/* Wishlist */}
                        <button
                            className="nav-item icon-btn"
                            onClick={onWishlistClick}
                            title="Wishlist"
                        >
                            <div className="icon-wrapper">
                                <FaHeart className="nav-icon" />
                                {wishlistItemsCount > 0 && (
                                    <span className="badge">
                                        {wishlistItemsCount}
                                    </span>
                                )}
                            </div>
                            <span className="nav-label">Wishlist</span>
                        </button>

                        {/* Shopping Cart */}
                        <button
                            className="nav-item icon-btn"
                            onClick={onCartClick}
                            title="Cart"
                        >
                            <div className="icon-wrapper">
                                <FaShoppingCart className="nav-icon" />
                                {cartItemsCount > 0 && (
                                    <span className="badge">
                                        {cartItemsCount}
                                    </span>
                                )}
                            </div>
                            <span className="nav-label">Cart</span>
                        </button>

                        {/* User Account */}
                        <div className="nav-item user-menu-container" ref={userMenuRef}>
                            {userLoggedIn ? (
                                <button
                                    className="user-trigger"
                                    onClick={toggleDropdown}
                                >
                                    <FaUserCircle className="nav-icon user-avatar" />
                                    <span className="username">{currentUser?.username?.split(' ')[0] || 'User'}</span>
                                </button>
                            ) : (
                                <button
                                    className="login-btn"
                                    onClick={onLoginClick}
                                >
                                    Login
                                </button>
                            )}

                            <AnimatePresence>
                                {isDropdownOpen && userLoggedIn && (
                                    <motion.div
                                        ref={dropdownRef}
                                        className="dropdown-menu"
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="dropdown-header">
                                            <span className="dropdown-username">{currentUser?.username}</span>
                                            <span className="dropdown-email">{currentUser?.email}</span>
                                        </div>
                                        {/* <div className="dropdown-divider" /> */}
                                        <button className="dropdown-item" onClick={handleProfileClick}>
                                            <FaUser className="dropdown-icon" /> Profile
                                        </button>
                                        <button className="dropdown-item" onClick={handleMyOrdersClick}>
                                            <FaShoppingBag className="dropdown-icon" /> My Orders
                                        </button>
                                        <div className="dropdown-divider" />
                                        <button className="dropdown-item logout" onClick={handleLogout}>
                                            <FaSignOutAlt className="dropdown-icon" /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </header>

            {/* Coins Drawer Overlay */}
            <CoinsDrawer
                isOpen={showCoinsDrawer}
                onClose={() => setShowCoinsDrawer(false)}
                currentUser={currentUser}
            />
        </>
    );
};

export default Header;
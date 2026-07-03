import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion"; // eslint-disable-line no-unused-vars
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import AuthModal from "../components/features/AuthModal";
import Footer from "../components/common/Footer";
import ProductCard from "../components/features/ProductCard";
import { FaCoins, FaCopy, FaShare, FaHistory, FaTimes, FaArrowRight } from 'react-icons/fa';
import tshirtImg from "../assets/t-shirts.jpg";
import { authAPI, productAPI } from "../utils/api";
import { generateReferralCode } from "../utils/helpers";
import '../styles/pages/Home.css';

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [postLoginAction, setPostLoginAction] = useState(null);
  const [coinsModalOpen, setCoinsModalOpen] = useState(false);
  const [coinHistory, setCoinHistory] = useState([]);
  const [referralLink, setReferralLink] = useState("");

  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  useEffect(() => {
    checkSession();
    fetchCategoryProducts();
    fetchFeaturedProducts();
    fetchLatestProducts();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      generateReferralLink();
      fetchCoinHistory();
    }
  }, [currentUser?.id]);

  const checkSession = async () => {
    try {
      const response = await authAPI.checkSession();
      if (response.data.status === "active") {
        setUserLoggedIn(true);
        setCurrentUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        setUserLoggedIn(false);
        setCurrentUser(null);
        localStorage.removeItem("user");
      }
    } catch {
      console.log("No active session");
      setUserLoggedIn(false);
      setCurrentUser(null);
      localStorage.removeItem("user");
    }
  };

  const fetchCategoryProducts = async () => {
    try {
      const categories = ["T-Shirts", "Shirts", "Hoodies", "Formals", "Casuals", "Party Wear", "Trending"];
      const productsByCategory = {};

      for (const category of categories) {
        const res = await productAPI.getByCategory(category);
        productsByCategory[category] = res.data;
      }

      setCategoryProducts(productsByCategory);
    } catch (error) {
      console.error("Error fetching category products:", error);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const res = await productAPI.getAll();
      const shuffled = res.data.sort(() => 0.5 - Math.random());
      setFeaturedProducts(shuffled.slice(0, 3));
    } catch (error) {
      console.error("Error fetching featured products:", error);
    }
  };

  const fetchLatestProducts = async () => {
    try {
      const res = await productAPI.getAll();
      // Sort by ID descending (assuming higher ID = newer) or reverse default order
      const latest = res.data.sort((a, b) => b.id - a.id).slice(0, 4);
      setLatestProducts(latest);
    } catch (error) {
      console.error("Error fetching latest products:", error);
    }
  };

  const fetchCoinHistory = async () => {
    try {
      const mockHistory = [
        { id: 1, type: 'welcome_bonus', amount: 5, description: 'Welcome bonus for signing up', date: new Date().toISOString(), balanceAfter: 5 },
        { id: 2, type: 'order_bonus', amount: 20, description: 'Order placed #1001 - 2 items', date: new Date().toISOString(), balanceAfter: 25 }
      ];
      setCoinHistory(mockHistory);
    } catch (error) {
      console.error("Error fetching coin history:", error);
    }
  };

  const generateReferralLink = async () => {
    if (!currentUser || !currentUser.id) {
      setReferralLink("Please login to get referral link");
      return;
    }

    try {
      const code = generateReferralCode(currentUser.username);
      const link = `${window.location.origin}/signup?ref=${code}`;
      setReferralLink(link);

      const updatedUser = { ...currentUser, referralCode: code };
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error generating referral link:", error);
      setReferralLink("Unable to generate referral link");
    }
  };

  const copyReferralLink = () => {
    if (!referralLink || referralLink.includes("Please login") || referralLink.includes("Unable to generate")) {
      alert('Referral link is not available. Please make sure you are logged in.');
      return;
    }

    navigator.clipboard.writeText(referralLink).then(() => {
      alert('Referral link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const shareReferralLink = async () => {
    if (!referralLink || referralLink.includes("Please login") || referralLink.includes("Unable to generate")) {
      alert('Referral link is not available. Please make sure you are logged in.');
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Mascle!',
          text: `Use my referral link to join Mascle and get 5 coins bonus!`,
          url: referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  const handleLogin = async (userData) => {
    console.log("Login successful, user data:", userData);
    setUserLoggedIn(true);
    setCurrentUser(userData);
    setModalOpen(false);

    if (postLoginAction === "wishlist") {
      navigate("/wishlist");
    } else if (postLoginAction === "cart") {
      navigate("/cart");
    } else if (postLoginAction === "products") {
      navigate("/products");
    }
    setPostLoginAction(null);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUserLoggedIn(false);
      setCurrentUser(null);
      localStorage.removeItem("user");
      setCoinsModalOpen(false);
      alert("Logged out successfully!");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  const handleBuyNow = () => {
    navigate("/products");
  };

  const handleWishlistClick = () => {
    if (!userLoggedIn) {
      setModalOpen(true);
      setPostLoginAction("wishlist");
    } else {
      navigate("/wishlist");
    }
  };

  const handleCartClick = () => {
    if (!userLoggedIn) {
      setModalOpen(true);
      setPostLoginAction("cart");
    } else {
      navigate("/cart");
    }
  };

  const handleCoinsClick = () => {
    if (!userLoggedIn) {
      setModalOpen(true);
    } else {
      setCoinsModalOpen(true);
    }
  };

  const handleShopNow = () => {
    navigate("/products");
  };

  const handleViewAllProducts = () => {
    navigate("/products");
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const CoinsModal = () => (
    <div className="modal-overlay" onClick={() => setCoinsModalOpen(false)}>
      <div className="modal coins-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setCoinsModalOpen(false)}>
          <FaTimes />
        </button>

        <div className="coins-header">
          <FaCoins className="coins-large-icon" />
          <h2>My Coins</h2>
          <div className="total-coins">
            <span className="coins-amount">{currentUser?.coins || 0}</span>
            <span className="coins-label">Total Coins</span>
          </div>
        </div>

        <div className="referral-section">
          <h3>Earn More Coins</h3>
          <p>Share your referral link and earn coins when your friend signs up!</p>

          <div className="referral-link-container">
            <input
              type="text"
              value={referralLink || "Loading referral link..."}
              readOnly
              className="referral-input"
            />
            <div className="referral-actions">
              <button onClick={copyReferralLink} className="action-btn copy-btn"
                disabled={!referralLink || referralLink === "Loading referral link..."}>
                <FaCopy /> Copy
              </button>
              <button onClick={shareReferralLink} className="action-btn share-btn"
                disabled={!referralLink || referralLink === "Loading referral link..."}>
                <FaShare /> Share
              </button>
            </div>
          </div>
        </div>

        <div className="coin-history-section">
          <h3>
            <FaHistory className="history-icon" />
            Coin History
          </h3>
          <div className="history-list">
            {coinHistory.length > 0 ? (
              coinHistory.map(history => (
                <div key={history.id} className="history-item">
                  <div className="history-info">
                    <span className="history-description">{history.description}</span>
                    <span className="history-date">{new Date(history.date).toLocaleDateString()}</span>
                  </div>
                  <div className={`coin-change ${history.type}`}>
                    {history.amount > 0 ? '+' : ''}{history.amount}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-history">No coin history yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const categoryData = [
    { name: "T-Shirts", image: "https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&w=500" },
    { name: "Shirts", image: "https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=500" },
    { name: "Hoodies", image: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=500" },
    { name: "Formals", image: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=500" },
    { name: "Casuals", image: "https://images.pexels.com/photos/846741/pexels-photo-846741.jpeg?auto=compress&cs=tinysrgb&w=500" },
    { name: "Party Wear", image: "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=500" },
    { name: "Trending", image: "https://images.pexels.com/photos/837140/pexels-photo-837140.jpeg?auto=compress&cs=tinysrgb&w=500" }
  ];

  return (
    <div className="home-page">
      <Header
        userLoggedIn={userLoggedIn}
        currentUser={currentUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onLogout={handleLogout}
        onLoginClick={() => setModalOpen(true)}
        onWishlistClick={handleWishlistClick}
        onCartClick={handleCartClick}
        onCoinsClick={handleCoinsClick}
        onSidebarToggle={() => setSidebarOpen(true)}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        showHome={false}
        userLoggedIn={userLoggedIn}
        onLoginClick={() => {
          setSidebarOpen(false);
          setModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {modalOpen && (
        <AuthModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onLoginSuccess={handleLogin}
          defaultAction={postLoginAction}
        />
      )}

      {coinsModalOpen && <CoinsModal />}

      <div className="category-bar">
        {categoryData.map(category => (
          <motion.button
            key={category.name}
            className="category-item"
            onClick={() => handleCategoryClick(category.name)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src={category.image} alt={category.name} />
            <span>{category.name}</span>
          </motion.button>
        ))}
      </div>

      <section className="hero">
        <div className="video-background">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="hero-video"
            poster="https://images.pexels.com/photos/994517/pexels-photo-994517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          >
            <source src="https://videos.pexels.com/video-files/3205916/3205916-hd_1920_1080_25fps.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="video-overlay"></div>
        </div>
        <motion.div
          className="hero-content"
          style={{ y: y1 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Elevate Your Style
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Discover the latest trends in fashion with Mascle
          </motion.p>
          <motion.div
            className="cta-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <button className="cta-button" onClick={handleShopNow}>Shop Now</button>
            <button className="cta-button secondary" onClick={handleBuyNow}>Buy Now</button>
          </motion.div>
        </motion.div>
      </section>

      <motion.section
        className="latest-products-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="section-header">
          <div className="section-title">
            <h2>Latest Arrivals</h2>
          </div>
          <p className="section-subtitle">Fresh drops just for you</p>
        </div>
        <div className="products-grid compact">
          {latestProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onCardClick={() => handleProductClick(product.id)}
              onWishlistClick={(e) => {
                e.stopPropagation();
                if (!userLoggedIn) {
                  setModalOpen(true);
                  setPostLoginAction("wishlist");
                } else {
                  alert("Added to wishlist!");
                }
              }}
            />
          ))}
        </div>
        <div className="section-actions">
          <button className="view-all-btn" onClick={handleViewAllProducts}>
            View All Products <FaArrowRight />
          </button>
        </div>
      </motion.section>

      {/* <motion.section
        className="featured-products"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="section-header">
          <div className="section-title">
            <h2>Featured Products</h2>
          </div>
          <p className="section-subtitle">Curated just for you</p>
        </div>
        <div className="products-grid">
          {featuredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onCardClick={() => handleProductClick(product.id)}
              onWishlistClick={(e) => {
                e.stopPropagation();
                if (!userLoggedIn) {
                  setModalOpen(true);
                  setPostLoginAction("wishlist");
                } else {
                  alert("Added to wishlist!");
                }
              }}
            />
          ))}
        </div>
      </motion.section> */}

      <motion.section
        className="newsletter"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2>Stay Updated</h2>
        <p>Subscribe to our newsletter for the latest updates and offers</p>
        <div className="newsletter-form">
          <input type="email" placeholder="Enter your email" />
          <button>Subscribe</button>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Home;
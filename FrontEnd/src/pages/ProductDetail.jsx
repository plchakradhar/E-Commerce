// src/pages/ProductDetail.jsx - REFACTORED
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import AuthModal from "../components/features/AuthModal";
import Loading from "../components/common/Loading";
import ProductImageGallery from "../components/features/ProductDetail/ProductImageGallery";
import ProductInfo from "../components/features/ProductDetail/ProductInfo";
import ProductDescription from "../components/features/ProductDetail/ProductDescription";
import ProductReviews from "../components/features/ProductDetail/ProductReviews";
import RelatedProducts from "../components/features/ProductDetail/RelatedProducts";
import '../styles/pages/ProductDetail.css';
import { FaCopy } from "react-icons/fa";
import { productAPI, cartAPI, wishlistAPI, reviewAPI, authAPI } from "../utils/api";


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [postLoginAction, setPostLoginAction] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Check session on component mount
  useEffect(() => {
    checkUserStatus();
    fetchProduct();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
      if (product.sizes?.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product]);

  useEffect(() => {
    if (userLoggedIn && product && sessionChecked) {
      checkWishlistStatus();
    }
  }, [userLoggedIn, product, sessionChecked]);

  const checkUserStatus = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserLoggedIn(true);
        setCurrentUser(userData);
        verifySession(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        handleSessionExpired();
      }
    } else {
      setSessionChecked(true);
    }
  };

  const verifySession = async (userData) => {
    try {
      const sessionResponse = await authAPI.checkSession();
      if (sessionResponse.data.status === 'active') {
        setCurrentUser(sessionResponse.data.user);
        localStorage.setItem('user', JSON.stringify(sessionResponse.data.user));
      } else {
        handleSessionExpired();
      }
    } catch (error) {
      console.error("Session verification failed:", error);
    } finally {
      setSessionChecked(true);
    }
  };

  const handleSessionExpired = () => {
    setUserLoggedIn(false);
    setCurrentUser(null);
    setWishlisted(false);
    localStorage.removeItem('user');
    setSessionChecked(true);
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getById(id);
      if (response.data.images) {
        response.data.images.forEach((img, index) => {
          // console.log(`Image ${index}: ${img}, Type: ${getFileType(img)}`);
        });
      }
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getByProduct(id);
      setReviews(response.data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await productAPI.getAll();
      const related = response.data
        .filter(p => p.id !== product.id && p.category === product.category)
        .slice(0, 8);
      setRelatedProducts(related);
    } catch (error) {
      console.error("Error fetching related products:", error);
      setRelatedProducts([]);
    }
  };

  const checkWishlistStatus = async () => {
    if (!userLoggedIn || !product || !currentUser) return;

    try {
      const response = await wishlistAPI.get(currentUser.id);
      const wishlistItems = response.data || [];
      setWishlisted(wishlistItems.some(item => item.id === product.id));
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      if (error.response?.status === 401) {
        handleSessionExpired();
      }
    }
  };

  const toggleWishlist = async (e) => {
    e?.stopPropagation();

    if (!userLoggedIn) {
      setPostLoginAction("wishlist");
      setModalOpen(true);
      return;
    }

    try {
      if (wishlisted) {
        await wishlistAPI.remove(currentUser.id, product.id);
        setWishlisted(false);
      } else {
        await wishlistAPI.add(currentUser.id, product.id);
        setWishlisted(true);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      if (error.response?.status === 401) {
        handleSessionExpired();
        setModalOpen(true);
      } else {
        alert("Failed to update wishlist");
      }
    }
  };

  const addToCart = async (e) => {
    e?.stopPropagation();

    if (!userLoggedIn) {
      setPostLoginAction("cart");
      setModalOpen(true);
      return;
    }

    if (!selectedSize && product.sizes?.length > 0) {
      alert("Please select a size");
      return;
    }

    setAddingToCart(true);
    try {
      await cartAPI.add({
        userId: currentUser.id,
        productId: product.id,
        quantity: quantity,
        selectedSize: selectedSize
      });
      alert("Added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error.response?.status === 401) {
        handleSessionExpired();
        setModalOpen(true);
      } else {
        alert("Failed to add to cart");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = (e) => {
    e?.stopPropagation();

    if (!selectedSize && product.sizes?.length > 0) {
      alert("Please select a size");
      return;
    }

    if (!userLoggedIn) {
      setPostLoginAction("buynow");
      setModalOpen(true);
      return;
    }

    navigate('/checkout', {
      state: {
        items: [{
          ...product,
          selectedSize,
          quantity
        }]
      }
    });
  };

  const handleLoginSuccess = (user) => {
    setUserLoggedIn(true);
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    setModalOpen(false);
    setSessionChecked(true);

    if (postLoginAction === "cart") addToCart();
    if (postLoginAction === "wishlist") toggleWishlist();
    if (postLoginAction === "buynow") buyNow();
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      handleSessionExpired();
    }
  };

  if (loading) return <Loading message="Loading product details..." />;
  if (!product) return <div className="not-found">Product Not Found</div>;

  return (
    <>
      <Header
        userLoggedIn={userLoggedIn}
        currentUser={currentUser}
        onLogout={handleLogout}
        onLoginClick={() => setModalOpen(true)}
        onCartClick={() => userLoggedIn ? navigate("/cart") : setModalOpen(true)}
        onWishlistClick={() => userLoggedIn ? navigate("/wishlist") : setModalOpen(true)}
      />

      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <div className="product-detail-page">
        {/* Main Product Section */}
        <section className="product-main">
          <div className="container">
            <div className="product-layout">
              <ProductImageGallery
                product={product}
                wishlisted={wishlisted}
                toggleWishlist={toggleWishlist}
              />

              <ProductInfo
                product={product}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                quantity={quantity}
                setQuantity={setQuantity}
                addToCart={addToCart}
                buyNow={buyNow}
                addingToCart={addingToCart}
              />
            </div>
          </div>
        </section>

        <ProductDescription product={product} />

        <ProductReviews reviews={reviews} />

        <RelatedProducts relatedProducts={relatedProducts} />
      </div>

      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Share this Product</h3>
            <div className="share-content">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="url-input"
              />
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
              >
                <FaCopy /> Copy Link
              </button>
            </div>
            <button
              className="btn close-btn"
              onClick={() => setShowShareModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetail;
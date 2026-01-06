// src/pages/Products.jsx - REFACTORED
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";
import AuthModal from "../components/features/AuthModal";
import Footer from "../components/common/Footer";
import Loading from "../components/common/Loading";
import { productAPI, wishlistAPI, authAPI } from "../utils/api";
import { getImageUrl } from "../utils/imageUtils";
import '../styles/pages/Products.css';

import ProductHeader from "../components/features/Products/ProductHeader";
import CategoryBar from "../components/features/Products/CategoryBar";
import ProductGrid from "../components/features/Products/ProductGrid";
import ProductPagination from "../components/features/Products/ProductPagination";

const Products = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState("default");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [postLoginAction, setPostLoginAction] = useState(null);
    const [wishlistItems, setWishlistItems] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(12);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
    const [selectedPriceRange, setSelectedPriceRange] = useState({ min: 0, max: 10000 });
    const [ratingFilter, setRatingFilter] = useState(0);
    const [sessionChecked, setSessionChecked] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        checkSessionAndUserStatus();

        const queryParams = new URLSearchParams(location.search);
        const category = queryParams.get('category') || 'All';
        const search = queryParams.get('search') || '';
        setSelectedCategory(category);
        setSearchQuery(search);
        fetchProducts(category, search);
    }, [location]);

    const checkSessionAndUserStatus = async () => {
        try {
            const user = localStorage.getItem("user");
            if (user) {
                const userData = JSON.parse(user);
                setUserLoggedIn(true);
                setCurrentUser(userData);

                // Verify session is still valid
                const sessionResponse = await authAPI.checkSession();
                if (sessionResponse.data.status === 'active') {
                    // Session is valid, update user data
                    setCurrentUser(sessionResponse.data.user);
                    localStorage.setItem('user', JSON.stringify(sessionResponse.data.user));
                    fetchWishlistItems(sessionResponse.data.user.id);
                } else {
                    // Session expired
                    handleSessionExpired();
                }
            } else {
                setSessionChecked(true);
            }
        } catch (error) {
            console.error("Error checking session:", error);
            handleSessionExpired();
        }
    };

    const handleSessionExpired = () => {
        setUserLoggedIn(false);
        setCurrentUser(null);
        setWishlistItems(new Set());
        localStorage.removeItem("user");
    };

    const fetchProducts = async (category, search = "") => {
        try {
            setLoading(true);
            let productsData = [];

            if (search) {
                const res = await productAPI.search(search);
                productsData = res.data;
            } else if (category && category !== "All") {
                const res = await productAPI.getByCategory(category);
                productsData = res.data;
            } else {
                const res = await productAPI.getAll();
                productsData = res.data;
            }

            // Preload images for better UX
            preloadProductImages(productsData);

            // Calculate price range
            if (productsData.length > 0) {
                const prices = productsData.map(p => p.price).filter(p => p);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                setPriceRange({ min: minPrice, max: maxPrice });
                setSelectedPriceRange({ min: minPrice, max: maxPrice });
            }

            setProducts(productsData);
            setFilteredProducts(productsData);
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
            setFilteredProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const preloadProductImages = (productsData) => {
        productsData.slice(0, 8).forEach(product => {
            if (product.images?.[0]) {
                const imgUrl = getImageUrl(product.images[0]);
                if (imgUrl) {
                    const img = new Image();
                    img.src = imgUrl;
                }
            }
        });
    };

    const fetchWishlistItems = async (userId) => {
        if (!userId) return;

        try {
            const response = await wishlistAPI.get(userId);
            const wishlistProductIds = new Set(response.data.map(item => item.id));
            setWishlistItems(wishlistProductIds);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            if (error.response?.status === 401) {
                handleSessionExpired();
            }
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery) {
            navigate(`/products?search=${encodeURIComponent(trimmedQuery)}`);
            fetchProducts("All", trimmedQuery);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        navigate('/products');
        fetchProducts("All", "");
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
        if (category === "All") {
            navigate('/products');
            fetchProducts("All", "");
        } else {
            navigate(`/products?category=${encodeURIComponent(category)}`);
            fetchProducts(category, "");
        }
    };

    const handleLogin = (userData) => {
        setUserLoggedIn(true);
        setCurrentUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setModalOpen(false);
        fetchWishlistItems(userData.id);

        if (postLoginAction === "wishlist") {
            navigate("/wishlist");
        } else if (postLoginAction === "cart") {
            navigate("/cart");
        }
    };

    const handleLogout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            handleSessionExpired();
            navigate("/");
        }
    };

    const applySortingAndFilters = () => {
        let filtered = [...products];

        // Apply price filter
        filtered = filtered.filter(product =>
            product.price >= selectedPriceRange.min &&
            product.price <= selectedPriceRange.max
        );

        // Apply rating filter
        if (ratingFilter > 0) {
            filtered = filtered.filter(product =>
                (product.rating || 0) >= ratingFilter
            );
        }

        // Apply sorting
        switch (sortOption) {
            case "priceLowHigh":
                filtered.sort((a, b) => a.price - b.price);
                break;
            case "priceHighLow":
                filtered.sort((a, b) => b.price - a.price);
                break;
            case "rating":
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case "newest":
                filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
            case "discount":
                filtered.sort((a, b) => {
                    const discountA = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0;
                    const discountB = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0;
                    return discountB - discountA;
                });
                break;
            default:
                // Default sort by popularity (rating * review count)
                filtered.sort((a, b) => {
                    const scoreA = (a.rating || 0) * (a.reviewCount || 1);
                    const scoreB = (b.rating || 0) * (b.reviewCount || 1);
                    return scoreB - scoreA;
                });
                break;
        }

        setFilteredProducts(filtered);
        setCurrentPage(1);
    };

    useEffect(() => {
        applySortingAndFilters();
    }, [sortOption, products, selectedPriceRange, ratingFilter]);

    const handleWishlistClick = async (productId, e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userLoggedIn) {
            setPostLoginAction("wishlist");
            setModalOpen(true);
            return;
        }

        try {
            if (wishlistItems.has(productId)) {
                await wishlistAPI.remove(currentUser.id, productId);
                setWishlistItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(productId);
                    return newSet;
                });
            } else {
                await wishlistAPI.add(currentUser.id, productId);
                setWishlistItems(prev => new Set(prev).add(productId));
            }
        } catch (error) {
            console.error("Error updating wishlist:", error);
            if (error.response?.status === 401) {
                handleSessionExpired();
                setModalOpen(true);
            }
        }
    };

    const handleWishlistPageClick = () => {
        if (!userLoggedIn) {
            setPostLoginAction("wishlist");
            setModalOpen(true);
        } else {
            navigate("/wishlist");
        }
    };

    const handleCartClick = () => {
        if (!userLoggedIn) {
            setPostLoginAction("cart");
            setModalOpen(true);
        } else {
            navigate("/cart");
        }
    };

    // Apply filters
    const applyFilters = () => {
        setShowFilters(false);
        applySortingAndFilters();
    };

    const clearFilters = () => {
        setSelectedPriceRange({ min: priceRange.min, max: priceRange.max });
        setRatingFilter(0);
        setSortOption("default");
        setShowFilters(false);
    };

    const clearActiveFilter = (type) => {
        if (type === 'price') {
            setSelectedPriceRange({ min: priceRange.min, max: priceRange.max });
        } else if (type === 'rating') {
            setRatingFilter(0);
        }
    };

    // Pagination
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const categories = [
        "All", "T-Shirts", "Shirts", "Hoodies", "Formals", "Casuals", "Party Wear", "Trending"
    ];

    const ratingOptions = [
        { value: 4, label: "4★ & above" },
        { value: 3, label: "3★ & above" },
        { value: 2, label: "2★ & above" },
        { value: 1, label: "1★ & above" }
    ];

    return (
        <div className="products-page">
            <Header
                userLoggedIn={userLoggedIn}
                currentUser={currentUser}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
                onLogout={handleLogout}
                onLoginClick={() => setModalOpen(true)}
                onWishlistClick={handleWishlistPageClick}
                onCartClick={handleCartClick}
                onSidebarToggle={() => setSidebarOpen(true)}
            />

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {modalOpen && (
                <AuthModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onLoginSuccess={handleLogin}
                    defaultAction={postLoginAction}
                />
            )}

            <div className="products-container">
                <ProductHeader
                    searchQuery={searchQuery}
                    selectedCategory={selectedCategory}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                />

                {/* <CategoryBar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    handleCategorySelect={handleCategorySelect}
                /> */}

                <div className="products-content">
                    <ProductGrid
                        products={currentProducts}
                        loading={loading}
                        wishlistItems={wishlistItems}
                        handleWishlistClick={handleWishlistClick}
                        handleClearSearch={handleClearSearch}
                        activeFilters={{
                            price: (selectedPriceRange.min !== priceRange.min || selectedPriceRange.max !== priceRange.max) ? selectedPriceRange : null,
                            rating: ratingFilter > 0 ? ratingFilter : null
                        }}
                        clearActiveFilter={clearActiveFilter}
                    />

                    <ProductPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        paginate={paginate}
                    />
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Products;
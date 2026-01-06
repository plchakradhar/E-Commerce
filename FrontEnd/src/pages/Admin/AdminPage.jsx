import React, { useState, useEffect } from "react";
import axios from "axios";
import '../../styles/pages/adminpage.css';
import AdminLayout from "../Admin/AdminLayout";
import Dashboard from "../Admin/Dashboard";
import UsersManagement from "../Admin/UsersManagement";
import ProductsManagement from "../Admin/ProductsManagement";
import OrdersManagement from "../Admin/OrdersManagement";
import AdminReturns from "../Admin/AdminReturns";
import Settings from "../Admin/Settings";
import LoadingSpinner from "../Admin/common/LoadingSpinner";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const sessionResponse = await axios.get("http://localhost:8085/api/users/check-session", {
        withCredentials: true,
        timeout: 10000
      });

      if (sessionResponse.data.status === "active" && sessionResponse.data.user.isAdmin) {
        setCurrentUser(sessionResponse.data.user);
        fetchData();
      } else {
        setAccessDenied(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      }
    } catch (error) {
      console.error("Session check failed:", error);
      setAccessDenied(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersRes, productsRes, ordersRes] = await Promise.all([
        axios.get("http://localhost:8085/api/admin/users", {
          withCredentials: true,
          timeout: 15000
        }).catch(err => {
          throw new Error(`Users: ${err.response?.data?.message || err.message}`);
        }),
        axios.get("http://localhost:8085/api/admin/products", {
          timeout: 15000
        }).catch(err => {
          throw new Error(`Products: ${err.response?.data?.message || err.message}`);
        }),
        axios.get("http://localhost:8085/api/admin/orders", {
          withCredentials: true,
          timeout: 15000
        }).catch(err => {
          throw new Error(`Orders: ${err.response?.data?.message || err.message}`);
        })
      ]);

      // Safely set data with validation
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);

    } catch (error) {
      console.error("Error in fetchData:", error);
      setError(`Failed to fetch data: ${error.message}`);
      // Set empty arrays as fallback
      setUsers([]);
      setProducts([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8085/api/users/logout", {}, {
        withCredentials: true
      });
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  };

  // Statistics calculations with safe array access
  const stats = {
    totalUsers: Array.isArray(users) ? users.length : 0,
    totalProducts: Array.isArray(products) ? products.length : 0,
    totalOrders: Array.isArray(orders) ? orders.length : 0,
    totalRevenue: Array.isArray(orders) ? orders.reduce((total, order) => total + (parseFloat(order.total) || 0), 0) : 0,
    pendingOrders: Array.isArray(orders) ? orders.filter(order =>
      order.status === 'pending' || order.status === 'Pending'
    ).length : 0,
    lowStockProducts: Array.isArray(products) ? products.filter(product =>
      (product.stock || 0) > 0 && (product.stock || 0) <= 10
    ).length : 0,
    activeUsers: Array.isArray(users) ? users.filter(user =>
      user.active === true || user.active === 'true'
    ).length : 0,
    monthlyRevenue: Array.isArray(orders) ? orders
      .filter(order => {
        const orderDate = new Date(order.createdAt || order.orderDate);
        return orderDate.getMonth() === new Date().getMonth() &&
          orderDate.getFullYear() === new Date().getFullYear();
      })
      .reduce((total, order) => total + (parseFloat(order.total) || 0), 0) : 0,
    returnRequests: Array.isArray(orders) ? orders.filter(
      order => ['return_requested', 'return_confirmed', 'pickup_scheduled'].includes(order.status)
    ).length : 0
  };

  if (accessDenied) {
    return (
      <div className="access-denied">
        <div className="denied-content">
          <h2>🚫 Access Denied</h2>
          <p>You don't have permission to access the admin panel.</p>
          <p>Redirecting to home page...</p>
          <div className="debug-tips">
            <p><strong>To access admin panel:</strong></p>
            <ul>
              <li>• Log in with an admin account</li>
              <li>• Ensure your user has admin privileges</li>
              <li>• Check if the session is valid</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  if (error) {
    return (
      <div className="admin-error">
        <div className="error-content">
          <h2>❌ Error Loading Data</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchData} className="retry-btn">🔄 Retry</button>
            <button onClick={checkAdminAccess} className="retry-btn">🔐 Re-check Access</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentUser={currentUser}
      onLogout={handleLogout}
      stats={stats}
    >
      {activeTab === "dashboard" && (
        <Dashboard />
      )}
      {activeTab === "users" && (
        <UsersManagement
          users={users}
          currentUser={currentUser}
          onUserUpdate={fetchData}
        />
      )}
      {activeTab === "products" && (
        <ProductsManagement
          products={products}
          onProductUpdate={fetchData}
        />
      )}
      {activeTab === "orders" && (
        <OrdersManagement
          orders={orders}
          onOrderUpdate={fetchData}
        />
      )}
      {activeTab === "returns" && (
        <AdminReturns
          orders={orders}
          onUpdate={fetchData}
        />
      )}
      {activeTab === "settings" && (
        <Settings
          stats={{
            totalUsers: stats.totalUsers,
            totalProducts: stats.totalProducts,
            totalOrders: stats.totalOrders
          }}
          onRefresh={fetchData}
          onLogout={handleLogout}
          onAddProduct={() => setActiveTab("products")}
        />
      )}
    </AdminLayout>
  );
};

export default AdminPage;
import React, { useState, useEffect } from "react";
import {
  FaUsers, FaBox, FaChartBar, FaRupeeSign, FaShoppingCart,
  FaExclamationTriangle, FaCheckCircle, FaClock, FaSync
} from "react-icons/fa";
import StatsCard from "./common/StatsCard";
import axios from "axios";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    activeUsers: 0,
    monthlyRevenue: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Starting dashboard data fetch...");

      // First, check session to debug authentication
      try {
        const sessionResponse = await axios.get("http://localhost:8085/api/admin/debug-session", {
          withCredentials: true,
          timeout: 10000
        });
        console.log("🔐 Session debug:", sessionResponse.data);
        setSessionInfo(sessionResponse.data);

        if (!sessionResponse.data.userInSession || !sessionResponse.data.isAdmin) {
          throw new Error("Admin authentication failed. Please log in again as admin.");
        }
      } catch (sessionError) {
        console.error("Session check failed:", sessionError);
        throw new Error("Unable to verify admin session. Please log in again.");
      }

      // Fetch all data in parallel
      const requests = [
        // Users request
        axios.get("http://localhost:8085/api/admin/users", {
          withCredentials: true,
          timeout: 15000
        }).catch(err => {
          console.error("❌ Error fetching users:", err);
          if (err.response?.status === 401) {
            throw new Error("Admin access denied. Please check your permissions.");
          }
          console.warn("⚠️ Users fetch failed, using empty array as fallback");
          return { data: [] };
        }),

        // Products request
        axios.get("http://localhost:8085/api/admin/products", {
          timeout: 15000
        }).catch(err => {
          console.error("❌ Error fetching products:", err);
          console.warn("⚠️ Products fetch failed, using empty array as fallback");
          return { data: [] };
        }),

        // Orders request
        axios.get("http://localhost:8085/api/admin/orders", {
          withCredentials: true,
          timeout: 15000
        }).catch(err => {
          console.error("❌ Error fetching orders:", err);
          if (err.response?.status === 401) {
            throw new Error("Admin access denied. Please check your permissions.");
          }
          console.warn("⚠️ Orders fetch failed, using empty array as fallback");
          return { data: [] };
        })
      ];

      const [usersRes, productsRes, ordersRes] = await Promise.all(requests);

      console.log("📊 API Responses received:", {
        users: usersRes.data,
        products: productsRes.data,
        orders: ordersRes.data
      });

      // Handle response data safely
      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const products = Array.isArray(productsRes.data) ? productsRes.data : [];
      const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];

      console.log("✅ Processed data counts:", {
        users: users.length,
        products: products.length,
        orders: orders.length
      });

      // Calculate statistics
      const totalRevenue = orders.reduce((total, order) => {
        const orderTotal = parseFloat(order.total) || parseFloat(order.amount) || 0;
        return total + orderTotal;
      }, 0);

      const pendingOrders = orders.filter(order => {
        const status = (order.status || '').toLowerCase();
        return status === 'pending' || status === 'processing';
      }).length;

      const lowStockProducts = products.filter(product => {
        const stock = parseInt(product.stock) || parseInt(product.quantity) || 0;
        return stock > 0 && stock <= 10;
      }).length;

      const activeUsers = users.filter(user => {
        return user.active === true ||
          user.active === 'true' ||
          user.status === 'active' ||
          user.isActive === true;
      }).length;

      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = orders
        .filter(order => {
          const orderDate = new Date(order.createdAt || order.orderDate || order.date);
          return orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear;
        })
        .reduce((total, order) => {
          const orderTotal = parseFloat(order.total) || parseFloat(order.amount) || 0;
          return total + orderTotal;
        }, 0);

      // Get recent users (last 5 registered)
      const sortedUsers = [...users]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.registrationDate || a.joinDate || 0);
          const dateB = new Date(b.createdAt || b.registrationDate || b.joinDate || 0);
          return dateB - dateA;
        })
        .slice(0, 5);

      // Get recent orders (last 5 orders)
      const sortedOrders = [...orders]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.orderDate || a.date || 0);
          const dateB = new Date(b.createdAt || b.orderDate || b.date || 0);
          return dateB - dateA;
        })
        .slice(0, 5);

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
        activeUsers,
        monthlyRevenue
      });

      setRecentUsers(sortedUsers);
      setRecentOrders(sortedOrders);

      console.log("🎉 Dashboard data loaded successfully");

    } catch (error) {
      console.error("💥 Error fetching dashboard data:", error);
      const errorMessage = error.response
        ? `Server error: ${error.response.status} - ${error.response.data?.message || error.response.data}`
        : error.message || "Failed to load dashboard data. Please check if the server is running.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: FaUsers,
      label: "Total Users",
      value: stats.totalUsers,
      color: "#4e73df",
      description: "Registered users",
      trend: "+5%"
    },
    {
      icon: FaBox,
      label: "Total Products",
      value: stats.totalProducts,
      color: "#1cc88a",
      description: "Available products",
      trend: "+12%"
    },
    {
      icon: FaShoppingCart,
      label: "Total Orders",
      value: stats.totalOrders,
      color: "#36b9cc",
      description: "All time orders",
      trend: "+8%"
    },
    {
      icon: FaRupeeSign,
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      color: "#f6c23e",
      description: "Total sales revenue",
      trend: "+15%"
    },
    {
      icon: FaClock,
      label: "Pending Orders",
      value: stats.pendingOrders,
      color: "#e74a3b",
      description: "Orders awaiting processing",
      trend: stats.pendingOrders > 0 ? "Attention" : "Good"
    },
    {
      icon: FaExclamationTriangle,
      label: "Low Stock",
      value: stats.lowStockProducts,
      color: "#f6c23e",
      description: "Products with stock ≤ 10",
      trend: stats.lowStockProducts > 0 ? "Restock" : "Good"
    },
    {
      icon: FaCheckCircle,
      label: "Active Users",
      value: stats.activeUsers,
      color: "#1cc88a",
      description: "Currently active users",
      trend: "+3%"
    },
    {
      icon: FaRupeeSign,
      label: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue.toLocaleString('en-IN')}`,
      color: "#4e73df",
      description: "Revenue this month",
      trend: "+10%"
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner large"></div>
        <p>Loading dashboard data...</p>
        {sessionInfo && (
          <div className="session-debug">
            <p>Session Status: {sessionInfo.userInSession ? '✅ Authenticated' : '❌ No Session'}</p>
            {sessionInfo.userInSession && (
              <p>Admin: {sessionInfo.isAdmin ? '✅ Yes' : '❌ No'}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-content">
          <div className="error-icon">❌</div>
          <h2>Error Loading Dashboard</h2>
          <p className="error-message">{error}</p>

          <div className="debug-info">
            <h3>Debug Information:</h3>
            <ul>
              <li>• Check if backend server is running on http://localhost:8085</li>
              <li>• Verify you are logged in as an admin user</li>
              <li>• Check browser console for detailed errors</li>
              <li>• Ensure CORS is configured properly</li>
              <li>• Verify session cookies are being sent</li>
            </ul>

            {sessionInfo && (
              <div className="session-info">
                <h4>Session Debug:</h4>
                <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
              </div>
            )}
          </div>

          <div className="error-actions">
            <button onClick={fetchDashboardData} className="retry-btn">
              <FaSync /> Retry
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="login-btn"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard Overview</h1>
          <p className="dashboard-subtitle">Real-time statistics and analytics</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchDashboardData} className="refresh-btn">
            <FaSync /> Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <div className="activity-section">
          <div className="section-header">
            <h2>
              <FaUsers className="section-icon" />
              Recent Users
            </h2>
            <span className="section-count">{recentUsers.length} users</span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length > 0 ? (
                  recentUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {user.username?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="user-details">
                            <strong>{user.username || user.name || "N/A"}</strong>
                            <span>{user.fullName || "No name provided"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="email-cell">{user.email || "N/A"}</td>
                      <td>
                        <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="date-cell">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() :
                          user.registrationDate ? new Date(user.registrationDate).toLocaleDateString() :
                            "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">
                      <div className="empty-state">
                        <FaUsers className="empty-icon" />
                        <p>No users found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="activity-section">
          <div className="section-header">
            <h2>
              <FaShoppingCart className="section-icon" />
              Recent Orders
            </h2>
            <span className="section-count">{recentOrders.length} orders</span>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <tr key={order.id}>
                      <td className="order-id">#{(order.id || "").toString().padStart(6, '0')}</td>
                      <td>
                        {order.user ? (
                          <div className="customer-info">
                            <strong>{order.user.username || order.user.name || "Guest"}</strong>
                            <span>{order.user.email || ""}</span>
                          </div>
                        ) : (
                          "Guest"
                        )}
                      </td>
                      <td className="amount-cell">
                        ₹{(parseFloat(order.total) || parseFloat(order.amount) || 0).toFixed(2)}
                      </td>
                      <td>
                        <span className={`status-badge ${(order.status?.toLowerCase()) || 'pending'}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="date-cell">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() :
                          order.orderDate ? new Date(order.orderDate).toLocaleDateString() :
                            "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      <div className="empty-state">
                        <FaShoppingCart className="empty-icon" />
                        <p>No orders found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Session Debug (only in development) */}
      {import.meta.env.MODE === 'development' && sessionInfo && (
        <div className="debug-panel">
          <details>
            <summary>Session Debug Info</summary>
            <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
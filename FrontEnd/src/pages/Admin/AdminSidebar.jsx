import React from "react";
import {
  FaUsers, FaBox, FaChartBar, FaCog, FaSignOutAlt, FaUserCircle,
  FaShoppingCart, FaUndo
} from "react-icons/fa";

const AdminSidebar = ({ activeTab, setActiveTab, currentUser, stats, onLogout }) => {
  const menuItems = [
    { key: "dashboard", icon: FaChartBar, label: "Dashboard", count: null },
    { key: "users", icon: FaUsers, label: "Users", count: stats.totalUsers },
    { key: "products", icon: FaBox, label: "Products", count: stats.totalProducts },
    { key: "orders", icon: FaShoppingCart, label: "Orders", count: stats.totalOrders },
    { key: "returns", icon: FaUndo, label: "Returns", count: stats.returnRequests || null }, // Added count logic if available in stats, else null
    { key: "settings", icon: FaCog, label: "Settings", count: null }
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-logo">
        <h2>Admin Panel</h2>
        <div className="admin-user">
          <FaUserCircle />
          <span>{currentUser?.username || 'Admin'}</span>
        </div>
      </div>

      <div className="admin-menu">
        {menuItems.map(item => (
          <button
            key={item.key}
            className={activeTab === item.key ? "active" : ""}
            onClick={() => setActiveTab(item.key)}
          >
            <item.icon />
            {item.label}
            {item.count !== null && <span className="menu-count">{item.count}</span>}
          </button>
        ))}
      </div>

      <button className="logout-btn" onClick={onLogout}>
        <FaSignOutAlt /> Logout
      </button>
    </div>
  );
};

export default AdminSidebar;
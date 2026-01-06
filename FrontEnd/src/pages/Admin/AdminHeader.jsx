import React, { useState } from "react";
import { FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import SearchBox from "./common/SearchBox";

const AdminHeader = ({ activeTab, stats, onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const getHeaderTitle = () => {
    switch (activeTab) {
      case "dashboard": return "Dashboard Overview";
      case "users": return `User Management (${stats.totalUsers} users)`;
      case "products": return `Product Management (${stats.totalProducts} products)`;
      case "orders": return `Order Management (${stats.totalOrders} orders)`;
      case "settings": return "Settings";
      default: return "Admin Panel";
    }
  };

  return (
    <div className="admin-header">
      <h1>{getHeaderTitle()}</h1>
      
      <div className="header-controls">
        <SearchBox 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        
        {activeTab === "products" && (
          <button className="add-btn" onClick={onAddProduct}>
            <FaPlus /> Add Product
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;
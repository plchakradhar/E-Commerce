import React from "react";
import { FaPlus, FaChartBar, FaSignOutAlt } from "react-icons/fa";

const Settings = ({ stats, onRefresh, onLogout, onAddProduct }) => {
  return (
    <div className="settings">
      <h2>Admin Settings</h2>
      <div className="settings-grid">
        <div className="settings-card">
          <h3>System Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Version:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Users:</span>
              <span className="info-value">{stats.totalUsers}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Products:</span>
              <span className="info-value">{stats.totalProducts}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Orders:</span>
              <span className="info-value">{stats.totalOrders}</span>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons-vertical">
            <button className="action-btn primary" onClick={onAddProduct}>
              <FaPlus /> Add New Product
            </button>
            <button className="action-btn secondary" onClick={onRefresh}>
              <FaChartBar /> Refresh Data
            </button>
            <button className="action-btn warning" onClick={onLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
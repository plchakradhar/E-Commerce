import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = ({ 
  activeTab, 
  setActiveTab, 
  currentUser, 
  onLogout, 
  stats, 
  children 
}) => {
  return (
    <div className="admin-page">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        stats={stats}
        onLogout={onLogout}
      />
      <div className="admin-content">
        <AdminHeader 
          activeTab={activeTab}
          stats={stats}
          onAddProduct={() => setActiveTab("products")}
        />
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
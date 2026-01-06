import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";

const EditUserModal = ({ user, onClose, onSave }) => {
  const [editingUser, setEditingUser] = useState({ ...user });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`http://localhost:8085/api/admin/users/${editingUser.id}`, editingUser, {
        withCredentials: true
      });
      
      onSave();
      onClose();
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Edit User</h2>
          <button onClick={onClose} disabled={loading}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                value={editingUser.username} 
                onChange={(e) => setEditingUser({...editingUser, username: e.target.value})} 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={editingUser.email} 
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={editingUser.fullName} 
                onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})} 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Mobile</label>
              <input 
                type="text" 
                value={editingUser.mobile} 
                onChange={(e) => setEditingUser({...editingUser, mobile: e.target.value})} 
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={editingUser.isAdmin} 
                onChange={(e) => setEditingUser({...editingUser, isAdmin: e.target.checked})} 
                disabled={loading}
              />
              Administrator
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
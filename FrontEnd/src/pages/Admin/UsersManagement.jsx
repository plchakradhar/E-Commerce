import React, { useState } from "react";
import { FaEdit, FaTrash, FaCheck, FaTimes, FaSort } from "react-icons/fa";
import axios from "axios";
import EditUserModal from "./modals/EditUserModal";

const UsersManagement = ({ users, currentUser, onUserUpdate }) => {

  const [userFilter, setUserFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [editingUser, setEditingUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = (data) => {
    if (!Array.isArray(data)) return [];
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter =
      userFilter === "all" ||
      (userFilter === "admin" && user.isAdmin) ||
      (userFilter === "active" && user.active) ||
      (userFilter === "inactive" && !user.active);

    return matchesFilter;
  });

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`http://localhost:8085/api/admin/users/${userId}/status`,
        { active: !currentStatus },
        { withCredentials: true }
      );
      onUserUpdate();
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`http://localhost:8085/api/admin/users/${userId}`, {
        withCredentials: true
      });
      onUserUpdate();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  return (
    <div className="users-management">
      <div className="section-header">
        <h2>Manage Users ({filteredUsers.length} found)</h2>
        <div className="filter-controls">
          <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('username')}>
                User <FaSort />
              </th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedData(filteredUsers).map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <strong>{user.username}</strong>
                    <span>{user.fullName}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.mobile}</td>
                <td>
                  <button
                    className={`status-toggle ${user.active ? 'active' : 'inactive'}`}
                    onClick={() => toggleUserStatus(user.id, user.active)}
                  >
                    {user.active ? <FaCheck /> : <FaTimes />}
                    {user.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>
                  <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit"
                      onClick={() => {
                        setEditingUser(user);
                        setShowUserModal(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(user.id)}
                      disabled={user.isAdmin || user.id === currentUser?.id}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUserModal && editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          onSave={onUserUpdate}
        />
      )}
    </div>
  );
};

export default UsersManagement;
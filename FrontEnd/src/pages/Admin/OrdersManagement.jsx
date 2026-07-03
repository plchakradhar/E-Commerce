import React, { useState } from "react";
import { FaEye, FaSort, FaFileInvoice } from "react-icons/fa";
import axios from "axios";
import OrderDetailsModal from "./modals/OrderDetailsModal";
import { generatePDFInvoice } from "../../utils/pdfGenerator";

const OrdersManagement = ({ orders, onOrderUpdate }) => {

  const [orderFilter, setOrderFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

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

  const filteredOrders = orders.filter(order => {
    const matchesFilter =
      orderFilter === "all" ||
      (order.status || "").toLowerCase() === orderFilter.toLowerCase();

    return matchesFilter;
  });

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:8085/api/admin/orders/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      onOrderUpdate();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  return (
    <div className="orders-management">
      <div className="section-header">
        <h2>Manage Orders ({filteredOrders.length} found)</h2>
        <div className="filter-controls">
          <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)}>
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>
                Order ID <FaSort />
              </th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedData(filteredOrders).map(order => (
              <tr key={order.id}>
                <td>#{(order.id || "").toString().padStart(6, '0')}</td>
                <td>{order.user?.username || "Guest"}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{(order.items || []).length} items</td>
                <td>₹{(order.total || 0).toFixed(2)}</td>
                <td>
                  <select
                    value={order.status || 'pending'}
                    onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                    className={`status-select ${order.status || 'pending'}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="action-btn view"
                      title="View Details"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="action-btn"
                      title="Download Invoice"
                      style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => generatePDFInvoice(order)}
                    >
                      <FaFileInvoice />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showOrderModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={handleOrderStatusUpdate}
        />
      )}
    </div>
  );
};

export default OrdersManagement;
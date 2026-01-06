import React from "react";
import { FaTimes } from "react-icons/fa";

const OrderDetailsModal = ({ order, onClose, onStatusUpdate }) => {
  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2>Order Details - #{order.id.toString().padStart(6, '0')}</h2>
          <button onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="order-details">
          <div className="order-section">
            <h3>Customer Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>Name:</strong> {order.user?.username || "Guest"}
              </div>
              <div className="info-item">
                <strong>Email:</strong> {order.user?.email || "N/A"}
              </div>
              <div className="info-item">
                <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="order-section">
            <h3>Order Items</h3>
            <div className="order-items">
              {order.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    {item.product?.images?.[0] ? (
                      <img 
                        src={`http://localhost:8085${item.product.images[0]}`} 
                        alt={item.product.name}
                      />
                    ) : (
                      <div className="placeholder-image">No Image</div>
                    )}
                  </div>
                  <div className="item-details">
                    <h4>{item.product?.name || "Product"}</h4>
                    <p>Size: {item.size || "N/A"}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ₹{item.price}</p>
                  </div>
                  <div className="item-total">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-section">
            <h3>Order Summary</h3>
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{order.total?.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="order-section">
            <h3>Update Status</h3>
            <select 
              value={order.status || 'pending'} 
              onChange={(e) => onStatusUpdate(order.id, e.target.value)}
              className={`status-select ${order.status || 'pending'}`}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
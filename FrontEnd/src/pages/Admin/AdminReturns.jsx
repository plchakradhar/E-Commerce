import React, { useState } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimes, FaUndo, FaFileInvoice, FaTruck } from 'react-icons/fa';
import '../../styles/pages/adminpage.css';
import { orderAPI } from '../../utils/api';
import { generatePDFInvoice } from '../../utils/pdfGenerator';

const AdminReturns = ({ orders, onUpdate }) => {
    // Filter for return-related orders
    const returnOrders = orders.filter(
        order => ['return_requested', 'return_confirmed', 'pickup_scheduled', 'refunded', 'returned'].includes(order.status)
    );

    const [processingId, setProcessingId] = useState(null);

    const handleAction = async (orderId, newStatus) => {
        try {
            setProcessingId(orderId);
            await axios.put(`http://localhost:8085/api/admin/orders/${orderId}`,
                { status: newStatus },
                { withCredentials: true }
            );
            onUpdate();
        } catch (error) {
            console.error("Action failed", error);
            alert("Action failed. See console.");
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'return_requested': return <span className="status-badge pending">Requested</span>;
            case 'return_confirmed': return <span className="status-badge shipped">Confirmed</span>;
            case 'pickup_scheduled': return <span className="status-badge shipped">Pickup Scheduled</span>; // Re-use shipped color
            case 'refunded': return <span className="status-badge delivered">Refunded</span>;
            default: return <span className="status-badge">{status}</span>;
        }
    };

    return (
        <div className="admin-content-card">
            <div className="card-header">
                <h2><FaUndo /> Return Requests ({returnOrders.length})</h2>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {returnOrders.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="empty-cell">No active return requests</td>
                            </tr>
                        ) : (
                            returnOrders.map(order => (
                                <React.Fragment key={order.id}>
                                    <tr className="return-row-main">
                                        <td>#{order.id}</td>
                                        <td>
                                            <div className="user-info">
                                                <strong>{order.shippingInfo?.fullName}</strong>
                                                <div className="small-text">{order.shippingInfo?.email}</div>
                                                <div className="small-text">{order.shippingInfo?.phone}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="return-reason-box">
                                                <strong>{order.returnReason || 'N/A'}</strong>
                                                <p>{order.returnComment}</p>
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(order.status)}</td>
                                        <td>{new Date(order.returnRequestDate || order.updatedAt).toLocaleDateString()}</td>
                                        <td>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleAction(order.id, e.target.value)}
                                                className={`status-select ${order.status}`}
                                                disabled={processingId === order.id}
                                            >
                                                <option value="return_requested">Requested</option>
                                                <option value="return_confirmed">Confirmed</option>
                                                <option value="pickup_scheduled">Pickup Scheduled</option>
                                                <option value="returned">Picked</option>
                                                <option value="refunded">Refunded</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr className="return-row-details">
                                        <td colSpan="6">
                                            <div className="unified-details-card">
                                                <div className="unified-header">
                                                    <h3>Order Details</h3>
                                                    <button className="btn-download-invoice" onClick={() => generatePDFInvoice(order)}>
                                                        <FaFileInvoice /> Download Invoice
                                                    </button>
                                                </div>
                                                <div className="unified-grid">
                                                    <div className="detail-section">
                                                        <h4>Shipping Address</h4>
                                                        <p>{order.shippingInfo?.fullName}</p>
                                                        <p>{order.shippingInfo?.address}</p>
                                                        <p>{order.shippingInfo?.city}, {order.shippingInfo?.state} - {order.shippingInfo?.zipCode}</p>
                                                        <p>{order.shippingInfo?.phone}</p>
                                                        {order.shippingInfo?.landmark && <p>Landmark: {order.shippingInfo?.landmark}</p>}
                                                    </div>
                                                    <div className="detail-section">
                                                        <h4>Order Items</h4>
                                                        <ul className="mini-item-list">
                                                            {order.items?.map((item, idx) => (
                                                                <li key={idx}>
                                                                    <span>{item.productName} (x{item.quantity})</span>
                                                                    <span>{item.selectedSize ? `Size: ${item.selectedSize}` : ''}</span>
                                                                    <span>₹{item.price}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="detail-section invoice-section">
                                                        <h4>Invoice Details</h4>
                                                        <div className="invoice-row"><span>Subtotal:</span> <span>₹{order.total}</span></div>
                                                        <div className="invoice-row"><span>Payment:</span> <span>{order.paymentMethod?.toUpperCase()}</span></div>
                                                        <div className="invoice-row total"><span>Total Refund:</span> <span>₹{order.total}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminReturns;

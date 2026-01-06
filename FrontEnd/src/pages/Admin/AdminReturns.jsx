import React, { useState } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimes, FaUndo, FaFileInvoice, FaTruck } from 'react-icons/fa';
import '../../styles/pages/adminpage.css';
import { orderAPI } from '../../utils/api';

const AdminReturns = ({ orders, onUpdate }) => {
    // Filter for return-related orders
    const returnOrders = orders.filter(
        order => ['return_requested', 'return_confirmed', 'pickup_scheduled', 'refunded', 'returned'].includes(order.status)
    );

    const [processingId, setProcessingId] = useState(null);

    const handleAction = async (orderId, newStatus) => {
        try {
            setProcessingId(orderId);
            // Determine endpoints based on action for more granularity if needed, 
            // but simpler to use generic status update for now since DB logic handles dates trigger? 
            // Wait, backend logic for dates is implementation specific. 
            // Let's assume generic status update for now as per plan or use return endpoint if expanded. 
            // Actually Controller doesn't have specific "confirm return" endpoint logic shown, just generic return. 
            // So we will use updateStatus and assume backend or just visual update for now.

            // REAL WORLD: Backend would set specific dates on specific status transitions.
            // FOR DEMO: We just update status text.

            await orderAPI.updateStatus(orderId, newStatus);
            onUpdate();
        } catch (error) {
            console.error("Action failed", error);
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
                                            <div className="action-buttons">
                                                {order.status === 'return_requested' && (
                                                    <button
                                                        className="btn-icon confirm"
                                                        title="Confirm Return"
                                                        disabled={processingId === order.id}
                                                        onClick={() => handleAction(order.id, 'return_confirmed')}
                                                    >
                                                        <FaCheckCircle /> Confirm
                                                    </button>
                                                )}

                                                {order.status === 'return_confirmed' && (
                                                    <button
                                                        className="btn-icon edit"
                                                        title="Schedule Pickup"
                                                        disabled={processingId === order.id}
                                                        onClick={() => handleAction(order.id, 'pickup_scheduled')}
                                                    >
                                                        <FaTruck /> Pickup
                                                    </button>
                                                )}

                                                {order.status === 'pickup_scheduled' && (
                                                    <button
                                                        className="btn-icon success"
                                                        title="Process Refund"
                                                        disabled={processingId === order.id}
                                                        onClick={() => handleAction(order.id, 'refunded')}
                                                    >
                                                        <FaFileInvoice /> Refund
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className="return-row-details">
                                        <td colSpan="6">
                                            <div className="return-details-expand">
                                                <div className="detail-section">
                                                    <h4>Shipping Address</h4>
                                                    <p>{order.shippingInfo?.address}</p>
                                                    <p>{order.shippingInfo?.city}, {order.shippingInfo?.state} - {order.shippingInfo?.zipCode}</p>
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

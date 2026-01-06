import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCoins, FaHistory, FaGift } from 'react-icons/fa';
import { userAPI } from '../../utils/api';
import '../../styles/components/CoinsDrawer.css';

const CoinsDrawer = ({ isOpen, onClose, currentUser }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [referralData, setReferralData] = useState({ link: '', code: '' });
    const [referralLoading, setReferralLoading] = useState(false);

    useEffect(() => {
        if (isOpen && currentUser?.id) {
            fetchHistory();
            fetchReferral();
        }
    }, [isOpen, currentUser]);

    const fetchReferral = async () => {
        if (!currentUser?.id) return;
        setReferralLoading(true);
        try {
            const response = await userAPI.getReferralLink(currentUser.id);
            if (response.data && response.data.referralLink) {
                setReferralData({
                    link: response.data.referralLink,
                    code: response.data.referralCode
                });
            }
        } catch (error) {
            console.error("Error fetching referral:", error);
        } finally {
            setReferralLoading(false);
        }
    };

    const handleCopyReferral = () => {
        if (referralData.link) {
            navigator.clipboard.writeText(referralData.link);
            alert("Referral link copied!");
        }
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await userAPI.getCoinHistory(currentUser.id);
            // Access nested coinHistory array and sort by date
            const historyData = response.data.coinHistory || [];
            console.log("Coin History fetched:", historyData); // Debug log

            const sorted = historyData.sort((a, b) => {
                const dateA = a.date ? new Date(a.date) : new Date(0);
                const dateB = b.date ? new Date(b.date) : new Date(0);
                return dateB - dateA;
            });
            setHistory(sorted);
        } catch (error) {
            console.error("Error fetching coin history:", error);
        } finally {
            setLoading(false);
        }
    };

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setHistory([]); // Reset on close
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="drawer-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Drawer */}
                    <motion.div
                        className="coins-drawer"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    >
                        <div className="drawer-header">
                            <h2>My Rewards</h2>
                            <button className="close-drawer-btn" onClick={onClose}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="drawer-content">
                            {/* Balance Card */}
                            <div className="balance-card">
                                <div className="balance-info">
                                    <span className="label">Current Balance</span>
                                    <div className="amount-row">
                                        <FaCoins className="coin-icon-large" />
                                        <h1>{currentUser?.coins || 0}</h1>
                                    </div>
                                </div>
                                <div className="balance-shine" />
                            </div>

                            {/* History Section */}
                            <div className="history-section">
                                <div className="history-header">
                                    <FaHistory /> <h3>Recent Activity</h3>
                                </div>

                                {loading ? (
                                    <div className="history-loading">Loading activity...</div>
                                ) : history.length === 0 ? (
                                    <div className="history-empty">
                                        <div className="empty-icon"><FaGift /></div>
                                        <p>No activity yet. Start shopping or referring friends to earn!</p>
                                    </div>
                                ) : (
                                    <ul className="history-list">
                                        {history.map((item, index) => {
                                            const isPositive = item.type === 'EARNED' || item.amount > 0;
                                            return (
                                                <li key={item.id || index} className="history-item">
                                                    <div className="item-info">
                                                        <div className={`item-icon ${isPositive ? 'earned' : 'spent'}`}>
                                                            {isPositive ? '+' : '-'}
                                                        </div>
                                                        <div className="item-text">
                                                            <h4>{item.description || (isPositive ? 'Coins Earned' : 'Coins Spent')}</h4>
                                                            <span>{formatDate(item.date)}</span>
                                                        </div>
                                                    </div>
                                                    <div className={`item-amount ${isPositive ? 'positive' : 'negative'}`}>
                                                        {isPositive ? '+' : ''}{item.amount}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="drawer-footer">
                            <div className="referral-box">
                                <h3>Invite Friends & Earn</h3>
                                <p>Get 50 coins for every friend who joins!</p>

                                <div className="referral-input-group">
                                    <input
                                        type="text"
                                        readOnly
                                        value={referralData.link || 'Loading...'}
                                    />
                                    <button onClick={handleCopyReferral} disabled={!referralData.link}>
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CoinsDrawer;

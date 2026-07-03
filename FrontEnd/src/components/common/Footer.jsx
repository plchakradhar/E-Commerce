import React from 'react';
import { FaInstagram, FaTwitter, FaFacebookF, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars

import '../../styles/components/Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  const handleQuickLink = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <footer className="footer">
      <motion.div
        className="footer-content"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Brand Section */}
        <motion.div className="footer-section brand-section" variants={itemVariants}>
          <div className="footer-logo">
            <h3>Mascle</h3>
          </div>
          <p className="brand-description">
            Elevating everyday style with sustainable fashion for the conscious generation.
            Quality meets comfort in every thread.
          </p>
          <div className="contact-info">
            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <span>KL University, Guntur</span>
            </div>
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <span>+91 9398429136</span>
            </div>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>contact@genzfits.com</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div className="footer-section" variants={itemVariants}>
          <h4 className="section-title">Quick Links</h4>
          <ul className="footer-links">
            <li>
              <button onClick={() => handleQuickLink("/")} className="footer-link">
                Home
              </button>
            </li>
            <li>
              <button onClick={() => handleQuickLink("/products")} className="footer-link">
                Shop All
              </button>
            </li>
            <li>
              <button onClick={() => handleQuickLink("/products?category=men")} className="footer-link">
                Men's Collection
              </button>
            </li>
            <li>
              <button onClick={() => handleQuickLink("/products?category=women")} className="footer-link">
                Women's Collection
              </button>
            </li>
            <li>
              <button onClick={() => handleQuickLink("/products?category=accessories")} className="footer-link">
                Accessories
              </button>
            </li>
          </ul>
        </motion.div>

        {/* Customer Service */}
        <motion.div className="footer-section" variants={itemVariants}>
          <h4 className="section-title">Customer Service</h4>
          <ul className="footer-links">
            <li>
              <button className="footer-link">Shipping Info</button>
            </li>
            <li>
              <button className="footer-link">Returns & Exchanges</button>
            </li>
            <li>
              <button className="footer-link">Size Guide</button>
            </li>
            <li>
              <button className="footer-link">FAQ</button>
            </li>
            <li>
              <button className="footer-link">Privacy Policy</button>
            </li>
          </ul>
        </motion.div>

        {/* Newsletter & Social */}
        <motion.div className="footer-section" variants={itemVariants}>
          <h4 className="section-title">Stay Connected</h4>
          <p className="newsletter-text">
            Subscribe to get updates on new arrivals and special offers
          </p>

          <form className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-btn">
              Subscribe
            </button>
          </form>

          <div className="social-section">
            <h5>Follow Us</h5>
            <div className="social-icons">
              <a href="#" className="social-link" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="social-link" aria-label="Facebook">
                <FaFacebookF />
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2025 GenZFits. All rights reserved.</p>
          <div className="footer-bottom-links">
            <button className="bottom-link">Terms of Service</button>
            <span className="divider">|</span>
            <button className="bottom-link">Privacy Policy</button>
            <span className="divider">|</span>
            <button className="bottom-link">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
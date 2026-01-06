import React, { useState } from "react";
import { FaTimes, FaCalculator } from "react-icons/fa";
import axios from "axios";

const EditProductModal = ({ product, onClose, onSave }) => {
  const [editingProduct, setEditingProduct] = useState({ 
    ...product,
    sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes,
    features: Array.isArray(product.features) ? product.features.join(', ') : product.features
  });
  const [loading, setLoading] = useState(false);
  const [calculatedDiscount, setCalculatedDiscount] = useState(0);

  // Calculate discount automatically when prices change
  const calculateDiscount = (price, originalPrice) => {
    if (!price || !originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const handlePriceChange = (field, value) => {
    const updatedProduct = {
      ...editingProduct,
      [field]: value
    };
    
    setEditingProduct(updatedProduct);
    
    // Auto-calculate discount
    if (updatedProduct.originalPrice && updatedProduct.price) {
      const discount = calculateDiscount(parseFloat(updatedProduct.price), parseFloat(updatedProduct.originalPrice));
      setCalculatedDiscount(discount);
      if (discount > 0) {
        setEditingProduct(prev => ({ ...prev, discount: discount.toString() }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...editingProduct,
        price: parseFloat(editingProduct.price),
        stock: parseInt(editingProduct.stock),
        originalPrice: parseFloat(editingProduct.originalPrice),
        discount: parseInt(editingProduct.discount || "0"),
        sizes: editingProduct.sizes.split(",").map(s => s.trim()).filter(s => s),
        features: editingProduct.features.split(",").map(f => f.trim()).filter(f => f),
        assured: Boolean(editingProduct.assured),
        isNew: Boolean(editingProduct.isNew)
      };

      await axios.put(`http://localhost:8085/api/admin/products/${editingProduct.id}`, payload, {
        withCredentials: true
      });
      
      onSave();
      onClose();
      alert("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <div className="modal-header">
          <h2>Edit Product</h2>
          <button onClick={onClose} disabled={loading}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input 
                type="text" 
                value={editingProduct.name} 
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Original Price (₹) *</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                value={editingProduct.originalPrice} 
                onChange={(e) => handlePriceChange('originalPrice', e.target.value)} 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Selling Price (₹) *</label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                value={editingProduct.price} 
                onChange={(e) => handlePriceChange('price', e.target.value)} 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Discount (%)</label>
              <div className="discount-display">
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={editingProduct.discount} 
                  onChange={(e) => setEditingProduct({...editingProduct, discount: e.target.value})} 
                  disabled={loading}
                />
                {calculatedDiscount > 0 && (
                  <span className="calculated-discount">
                    <FaCalculator /> Auto-calculated: {calculatedDiscount}%
                  </span>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select 
                value={editingProduct.category} 
                onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} 
                required
                disabled={loading}
              >
                <option value="T-Shirts">T-Shirts</option>
                <option value="Shirts">Shirts</option>
                <option value="Hoodies">Hoodies</option>
                <option value="Jeans">Jeans</option>
                <option value="Shoes">Shoes</option>
                <option value="Formals">Formals</option>
                <option value="Casuals">Casuals</option>
                <option value="Party Wear">Party Wear</option>
                <option value="Trending">Trending</option>
              </select>
            </div>
            <div className="form-group">
              <label>Stock *</label>
              <input 
                type="number" 
                min="0"
                value={editingProduct.stock} 
                onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})} 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Brand</label>
              <input 
                type="text" 
                value={editingProduct.brand} 
                onChange={(e) => setEditingProduct({...editingProduct, brand: e.target.value})} 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Sizes (comma-separated) *</label>
              <input 
                type="text" 
                value={editingProduct.sizes} 
                onChange={(e) => setEditingProduct({...editingProduct, sizes: e.target.value})} 
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Material/Fabric</label>
              <input 
                type="text" 
                value={editingProduct.material || ''} 
                onChange={(e) => setEditingProduct({...editingProduct, material: e.target.value})} 
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Product Description</label>
            <textarea 
              rows="4"
              value={editingProduct.description} 
              onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} 
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Care Instructions</label>
            <textarea 
              rows="3"
              value={editingProduct.careInstructions || ''} 
              onChange={(e) => setEditingProduct({...editingProduct, careInstructions: e.target.value})} 
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Features (comma-separated)</label>
            <input 
              type="text" 
              value={editingProduct.features} 
              onChange={(e) => setEditingProduct({...editingProduct, features: e.target.value})} 
              disabled={loading}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={editingProduct.assured} 
                onChange={(e) => setEditingProduct({...editingProduct, assured: e.target.checked})} 
                disabled={loading}
              />
              Assured Product
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={editingProduct.isNew} 
                onChange={(e) => setEditingProduct({...editingProduct, isNew: e.target.checked})} 
                disabled={loading}
              />
              Mark as New Arrival
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
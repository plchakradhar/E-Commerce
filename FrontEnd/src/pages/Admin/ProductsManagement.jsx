import React, { useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import axios from "axios";
import ProductCard from "./common/ProductCard";
import AddProductModal from "./modals/AddProductModal";
import EditProductModal from "./modals/EditProductModal";

const ProductsManagement = ({ products, onProductUpdate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      productFilter === "all" ||
      (productFilter === "inStock" && product.stock > 0) ||
      (productFilter === "outOfStock" && product.stock <= 0) ||
      (productFilter === "assured" && product.assured) ||
      (productFilter === "new" && product.isNew);
    
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await axios.delete(`http://localhost:8085/api/admin/products/${productId}`, {
        withCredentials: true
      });
      onProductUpdate();
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  return (
    <div className="products-management">
      <div className="section-header">
        <h2>Manage Products ({filteredProducts.length} found)</h2>
        <div className="controls">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
            <option value="all">All Products</option>
            <option value="inStock">In Stock</option>
            <option value="outOfStock">Out of Stock</option>
            <option value="assured">Assured</option>
            <option value="new">New Arrivals</option>
          </select>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Add Product
          </button>
        </div>
      </div>
      
      <div className="products-grid">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onSave={onProductUpdate}
        />
      )}

      {showEditModal && editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          onSave={onProductUpdate}
        />
      )}
    </div>
  );
};

export default ProductsManagement;
import React, { useState } from "react";
import { FaTimes, FaUpload, FaTrash, FaPlay, FaCalculator } from "react-icons/fa";
import axios from "axios";

const AddProductModal = ({ onClose, onSave }) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    description: "",
    images: [],
    stock: "",
    discount: "",
    assured: false,
    brand: "",
    sizes: "",
    material: "",
    careInstructions: "",
    features: "",
    isNew: false
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [calculatedDiscount, setCalculatedDiscount] = useState(0);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Accept both images and videos
    const validTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg",
      "video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm"
    ];

    const validFiles = files.filter(file => 
      validTypes.includes(file.type)
    );

    if (validFiles.length !== files.length) {
      alert("Some files were invalid. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, AVI, MOV, WMV) are allowed.");
    }

    // Add new files to existing ones (limit to 20 files)
    const totalFiles = mediaFiles.length + validFiles.length;
    if (totalFiles > 20) {
      alert("Maximum 20 files allowed. You can upload " + (20 - mediaFiles.length) + " more files.");
      setMediaFiles(prev => [...prev, ...validFiles.slice(0, 20 - mediaFiles.length)]);
    } else {
      setMediaFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeMediaFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate discount automatically when prices change
  const calculateDiscount = (price, originalPrice) => {
    if (!price || !originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const handlePriceChange = (field, value) => {
    const updatedProduct = {
      ...newProduct,
      [field]: value
    };
    
    setNewProduct(updatedProduct);
    
    // Auto-calculate discount
    if (updatedProduct.originalPrice && updatedProduct.price) {
      const discount = calculateDiscount(parseFloat(updatedProduct.price), parseFloat(updatedProduct.originalPrice));
      setCalculatedDiscount(discount);
      if (discount > 0) {
        setNewProduct(prev => ({ ...prev, discount: discount.toString() }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mediaUrls = [];
      
      if (mediaFiles.length > 0) {
        // Upload files one by one to track progress
        for (let i = 0; i < mediaFiles.length; i++) {
          const file = mediaFiles[i];
          const formData = new FormData();
          formData.append("files", file);
          
          setUploadProgress(prev => ({
            ...prev,
            [i]: 0
          }));

          const uploadResponse = await axios.post(
            "http://localhost:8085/api/admin/products/upload-images",
            formData,
            { 
              headers: { "Content-Type": "multipart/form-data" },
              withCredentials: true,
              onUploadProgress: (progressEvent) => {
                const progress = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadProgress(prev => ({
                  ...prev,
                  [i]: progress
                }));
              }
            }
          );
          
          // Assuming the API returns an array of URLs
          if (uploadResponse.data && uploadResponse.data.length > 0) {
            mediaUrls.push(uploadResponse.data[0]);
          }
        }
      }

      // Prepare features array
      const featuresArray = newProduct.features 
        ? newProduct.features.split(',').map(f => f.trim()).filter(f => f)
        : [];

      const payload = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        originalPrice: parseFloat(newProduct.originalPrice || newProduct.price),
        discount: parseInt(newProduct.discount || "0"),
        images: mediaUrls,
        sizes: newProduct.sizes.split(",").map(s => s.trim()).filter(s => s),
        assured: Boolean(newProduct.assured),
        isNew: Boolean(newProduct.isNew),
        material: newProduct.material || "",
        careInstructions: newProduct.careInstructions || "",
        features: featuresArray
      };

      await axios.post("http://localhost:8085/api/admin/products", payload, {
        withCredentials: true
      });
      
      onSave();
      onClose();
      alert("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setUploadProgress({});
    }
  };

  const isVideoFile = (file) => {
    return file.type.startsWith('video/');
  };

  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <div className="modal-header">
          <h2>Add New Product</h2>
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
                value={newProduct.name} 
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
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
                value={newProduct.originalPrice} 
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
                value={newProduct.price} 
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
                  value={newProduct.discount} 
                  onChange={(e) => setNewProduct({...newProduct, discount: e.target.value})} 
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
                value={newProduct.category} 
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} 
                required
                disabled={loading}
              >
                <option value="">Select Category</option>
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
                value={newProduct.stock} 
                onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Brand</label>
              <input 
                type="text" 
                value={newProduct.brand} 
                onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})} 
                disabled={loading}
                placeholder="e.g., MASCLE, Nike, etc."
              />
            </div>
            <div className="form-group">
              <label>Sizes (comma-separated) *</label>
              <input 
                type="text" 
                value={newProduct.sizes} 
                onChange={(e) => setNewProduct({...newProduct, sizes: e.target.value})} 
                placeholder="S,M,L,XL,XXL"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Material/Fabric</label>
              <input 
                type="text" 
                value={newProduct.material} 
                onChange={(e) => setNewProduct({...newProduct, material: e.target.value})} 
                disabled={loading}
                placeholder="e.g., Cotton 100%, Polyester, etc."
              />
            </div>
          </div>

          <div className="form-group">
            <label>Product Description</label>
            <textarea 
              rows="4"
              value={newProduct.description} 
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} 
              placeholder="Enter detailed product description..."
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Care Instructions</label>
            <textarea 
              rows="3"
              value={newProduct.careInstructions} 
              onChange={(e) => setNewProduct({...newProduct, careInstructions: e.target.value})} 
              placeholder="Enter care instructions..."
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Features (comma-separated)</label>
            <input 
              type="text" 
              value={newProduct.features} 
              onChange={(e) => setNewProduct({...newProduct, features: e.target.value})} 
              placeholder="e.g., Quick Dry, Stretchable, Breathable"
              disabled={loading}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={newProduct.assured} 
                onChange={(e) => setNewProduct({...newProduct, assured: e.target.checked})} 
                disabled={loading}
              />
              Assured Product
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={newProduct.isNew} 
                onChange={(e) => setNewProduct({...newProduct, isNew: e.target.checked})} 
                disabled={loading}
              />
              Mark as New Arrival
            </label>
          </div>

          <div className="form-group">
            <label>Upload Media (Images & Videos) - Max 20 files *</label>
            <div className="file-upload">
              <FaUpload />
              <input 
                type="file" 
                multiple 
                accept="image/*,video/*" 
                onChange={handleMediaChange} 
                required={mediaFiles.length === 0}
                disabled={loading || mediaFiles.length >= 20}
              />
              <span>
                {mediaFiles.length >= 20 
                  ? "Maximum 20 files reached" 
                  : `Click to upload images and videos (${mediaFiles.length}/20)`
                }
              </span>
            </div>
            
            {mediaFiles.length > 0 && (
              <div className="media-preview">
                <h4>Selected Media ({mediaFiles.length} files)</h4>
                <div className="media-grid">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="media-item">
                      {isVideoFile(file) ? (
                        <div className="video-preview">
                          <FaPlay className="video-icon" />
                          <video>
                            <source src={URL.createObjectURL(file)} type={file.type} />
                          </video>
                          <span className="file-type">Video</span>
                        </div>
                      ) : (
                        <div className="image-preview">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`Preview ${index + 1}`}
                          />
                          <span className="file-type">Image</span>
                        </div>
                      )}
                      <div className="media-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                        {uploadProgress[index] !== undefined && (
                          <div className="upload-progress">
                            <div 
                              className="progress-bar" 
                              style={{ width: `${uploadProgress[index]}%` }}
                            >
                              {uploadProgress[index]}%
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="remove-media"
                        onClick={() => removeMediaFile(index)}
                        disabled={loading}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
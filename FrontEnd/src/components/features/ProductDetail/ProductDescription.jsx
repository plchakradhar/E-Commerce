import React from 'react';
import { FaCheck } from 'react-icons/fa';

const ProductDescription = ({ product }) => {
    if (!product.description && !product.careInstructions) return null;

    return (
        <section className="product-details-section">
            <div className="container">
                <div className="details-grid-container">
                    {product.description && (
                        <div className="description-card">
                            <h2 className="section-title">Product Description</h2>
                            <div className="description-content">
                                <p>{product.description}</p>
                            </div>
                        </div>
                    )}

                    {product.careInstructions && (
                        <div className="description-card">
                            <h2 className="section-title">Wash with Care</h2>
                            <div className="care-content">
                                <p>{product.careInstructions}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProductDescription;

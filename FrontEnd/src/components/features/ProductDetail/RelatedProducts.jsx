import React from 'react';
import ProductCard from '../ProductCard';

const RelatedProducts = ({ relatedProducts }) => {
    if (!relatedProducts || relatedProducts.length === 0) return null;

    return (
        <section className="similar-products">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Similar Products</h2>
                    <p className="section-subtitle">You might also like</p>
                </div>
                <div className="products-grid">
                    {relatedProducts.map((relatedProduct) => (
                        <ProductCard
                            key={relatedProduct.id}
                            product={relatedProduct}
                            showWishlist={true}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RelatedProducts;

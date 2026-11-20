import React from 'react';
import { useNavigate } from 'react-router-dom';
import './assets/styles.css';

export function ProductList({ products, onAddToCart }) {
  const navigate = useNavigate();

  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
        <h3>No products found</h3>
        <p>Try searching for something else or browse different categories.</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="product-grid">
        {products.map((product) => {
          const isOutOfStock = product.stock <= 0;
          const imageUrl = (product.images && product.images.length > 0)
            ? product.images[0]
            : 'https://via.placeholder.com/250x200?text=No+Image';

          return (
            <div
              key={product.product_id}
              className="product-card"
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => navigate(`/product/${product.product_id}`)}
            >
              {isOutOfStock && (
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: '#ef4444',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    zIndex: 2,
                  }}
                >
                  Out of Stock
                </span>
              )}

              <img
                src={imageUrl}
                alt={product.name}
                className="product-image"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/250x200?text=SalesSavvy';
                }}
              />
              <div className="product-info">
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6366f1', fontWeight: 600 }}>
                  {product.category || 'General'}
                </span>
                <h3 className="product-name" style={{ marginTop: '4px', marginBottom: '6px' }}>{product.name}</h3>
                <p className="product-description" style={{ color: '#6b7280', fontSize: '13px', maxHeight: '40px', overflow: 'hidden' }}>
                  {product.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <p className="product-price" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                    ₹{product.price}
                  </p>
                  <span style={{ fontSize: '12px', color: isOutOfStock ? '#ef4444' : '#10b981' }}>
                    {isOutOfStock ? 'Sold Out' : `In Stock: ${product.stock}`}
                  </span>
                </div>
                <button
                  className="add-to-cart-btn"
                  disabled={isOutOfStock}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    opacity: isOutOfStock ? 0.5 : 1,
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // prevent navigation to detail page
                    if (!isOutOfStock) {
                      onAddToCart(product.product_id);
                    }
                  }}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

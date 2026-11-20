import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from './AuthContext';
import './assets/styles.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [addedMessage, setAddedMessage] = useState(null);

  useEffect(() => {
    fetchProductDetails();
    if (user) {
      fetchCartCount();
    }
  }, [id, user]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:9090/api/products/${id}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Product not found');
      }
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await fetch('http://localhost:9090/api/cart/items/count', {
        credentials: 'include',
      });
      if (response.ok) {
        const count = await response.json();
        setCartCount(count);
      }
    } catch (e) {
      console.warn('Error fetching cart count:', e);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    try {
      const response = await fetch('http://localhost:9090/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: parseInt(id, 10),
          quantity: quantity,
        }),
      });

      if (response.ok) {
        setAddedMessage(`Added ${quantity} item(s) to your cart!`);
        fetchCartCount();
        setTimeout(() => setAddedMessage(null), 3000);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add item to cart.');
      }
    } catch (err) {
      alert('Error adding product to cart: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div>
        <Header cartCount={cartCount} username={user} />
        <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
          <h2>Loading product details...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Header cartCount={cartCount} username={user} />
        <div style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
          <h2>{error || 'Product not found'}</h2>
          <button
            onClick={() => navigate('/customerhome')}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            ← Back to Store
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const image = (product.images && product.images.length > 0)
    ? product.images[0]
    : 'https://via.placeholder.com/400?text=No+Image';

  return (
    <div>
      <Header cartCount={cartCount} username={user} />
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', minHeight: '70vh' }}>
        <button
          onClick={() => navigate('/customerhome')}
          style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '15px', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          ← Back to Catalog
        </button>

        {addedMessage && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px' }}>
            ✓ {addedMessage}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', background: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src={image}
              alt={product.name}
              style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '8px' }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=SalesSavvy'; }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ color: '#6366f1', fontWeight: 600, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '0.05em' }}>
              {product.category || 'General'}
            </span>
            <h1 style={{ fontSize: '28px', margin: '8px 0 16px', color: '#111827' }}>{product.name}</h1>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>
              ₹{product.price}
            </p>

            <div style={{ margin: '8px 0 24px', fontSize: '14px' }}>
              <span style={{ fontWeight: 600 }}>Availability: </span>
              <span style={{ color: isOutOfStock ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock} units available)`}
              </span>
            </div>

            <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '32px' }}>
              {product.description || 'No description provided for this product.'}
            </p>

            {!isOutOfStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{ padding: '6px 14px', background: '#f9fafb', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '6px 16px', fontWeight: 600 }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    style={{ padding: '6px 14px', background: '#f9fafb', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{
                padding: '14px 28px',
                background: isOutOfStock ? '#9ca3af' : '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {isOutOfStock ? 'Currently Unavailable' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

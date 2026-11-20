import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './assets/styles.css';

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
    fetchCartCount();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:9090/api/orders', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.products || []);
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
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return '#059669';
      case 'SHIPPED':
        return '#2563eb';
      case 'PROCESSING':
      case 'SUCCESS':
        return '#10b981';
      case 'CANCELLED':
      case 'FAILED':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header cartCount={cartCount} username={user} />
      <main className="main-content" style={{ flex: 1, maxWidth: '1000px', margin: '30px auto', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 className="form-title" style={{ margin: 0 }}>My Orders</h1>
          <Link to="/customerhome" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Store
          </Link>
        </div>

        {loading && <p style={{ textAlign: 'center', padding: '40px' }}>Loading your order history...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '12px' }}>
            <div style={{ fontSize: '50px', marginBottom: '16px' }}>📦</div>
            <h2>No orders found</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>You haven't placed any orders yet. Discover our latest items!</p>
            <Link
              to="/customerhome"
              style={{
                background: '#6366f1',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order, index) => (
              <div
                key={index}
                className="order-card"
                style={{
                  background: '#fff',
                  borderRadius: '10px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                  padding: '20px',
                  border: '1px solid #f3f4f6',
                }}
              >
                <div
                  className="order-card-header"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #f3f4f6',
                    paddingBottom: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Order ID</span>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>{order.order_id}</h3>
                    {order.created_at && (
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>Placed: {new Date(order.created_at).toLocaleDateString()}</span>
                    )}
                  </div>
                  <span
                    style={{
                      background: getStatusColor(order.status) + '15',
                      color: getStatusColor(order.status),
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  >
                    ● {order.status || 'SUCCESS'}
                  </span>
                </div>

                <div className="order-card-body" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <img
                    src={order.image_url || 'https://via.placeholder.com/100?text=Product'}
                    alt={order.name}
                    className="order-product-image"
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Product'; }}
                  />
                  <div className="order-details" style={{ flex: 1 }}>
                    <h3 className="product-name" style={{ margin: '0 0 6px', fontSize: '18px' }}>{order.name}</h3>
                    <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 10px' }}>{order.description}</p>
                    <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
                      <span>Qty: <strong>{order.quantity}</strong></span>
                      <span>Price: <strong>₹{order.price_per_unit?.toFixed(2)}</strong></span>
                      <span>Total: <strong style={{ color: '#6366f1' }}>₹{order.total_price?.toFixed(2)}</strong></span>
                    </div>

                    {order.shipping_address && (
                      <div style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280', background: '#f9fafb', padding: '8px', borderRadius: '4px' }}>
                        Shipping to: <strong>{order.recipient_name}</strong> - {order.shipping_address}, {order.city} {order.postal_code} (Phone: {order.phone})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

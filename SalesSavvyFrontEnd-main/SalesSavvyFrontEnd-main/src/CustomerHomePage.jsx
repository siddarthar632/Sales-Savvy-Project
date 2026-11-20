import React, { useState, useEffect } from 'react';
import { CategoryNavigation } from './CategoryNavigation';
import { ProductList } from './ProductList';
import { Footer } from './Footer';
import { Header } from './Header';
import { useAuth } from './AuthContext';
import './assets/styles.css';

export default function CustomerHomePage() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    fetchProducts(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  const fetchProducts = async (category = '', search = '') => {
    setLoading(true);
    try {
      let url = 'http://localhost:9090/api/products';
      const params = new URLSearchParams();
      if (category && category !== 'All') {
        params.append('category', category);
      }
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await fetch(url, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
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

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      alert('Please sign in to add products to your cart.');
      return;
    }
    try {
      const response = await fetch('http://localhost:9090/api/cart/add', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        fetchCartCount();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add product to cart');
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <div className="customer-homepage">
      <Header
        cartCount={cartCount}
        username={user || 'Guest'}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <nav className="navigation">
        <CategoryNavigation
          onCategoryClick={handleCategoryClick}
          selectedCategory={selectedCategory || 'All'}
        />
      </nav>
      <main className="main-content" style={{ minHeight: '60vh', padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <p>Loading products...</p>
          </div>
        ) : (
          <ProductList products={products} onAddToCart={handleAddToCart} />
        )}
      </main>
      <Footer />
    </div>
  );
}

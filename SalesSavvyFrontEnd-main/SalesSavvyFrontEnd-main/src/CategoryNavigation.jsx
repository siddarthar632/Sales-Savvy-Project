import React, { useEffect, useState } from 'react';
import './assets/styles.css';

export function CategoryNavigation({ onCategoryClick, selectedCategory = 'All' }) {
  const [categories, setCategories] = useState(['All', 'Shirts', 'Pants', 'Accessories', 'Mobiles', 'Mobile Accessories']);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:9090/api/categories', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const catNames = ['All', ...data.map((c) => c.categoryName)];
            // Deduplicate
            setCategories([...new Set(catNames)]);
          }
        }
      } catch (e) {
        console.warn('Using default categories:', e.message);
      }
    };
    fetchCategories();
  }, []);

  return (
    <nav className="category-navigation">
      <ul className="category-list">
        {categories.map((category, index) => (
          <li
            key={index}
            className={`category-item ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryClick(category === 'All' ? '' : category)}
            style={{
              cursor: 'pointer',
              fontWeight: selectedCategory === category || (selectedCategory === '' && category === 'All') ? 'bold' : 'normal',
              borderBottom: (selectedCategory === category || (selectedCategory === '' && category === 'All')) ? '2px solid #6366f1' : 'none',
              padding: '8px 12px',
            }}
          >
            {category}
          </li>
        ))}
      </ul>
    </nav>
  );
}

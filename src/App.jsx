import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function App() {
  const [product, setProduct] = useState({ name: '', price: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.name || !product.price) {
      setError('Name and price are required');
      return;
    }
    if (product.price < 0) {
      setError('Price cannot be negative');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, product);
      setProduct({ name: '', price: '', description: '' });
      setError('');
      alert('Product added successfully!');
    } catch (error) {
      console.error('Add product error:', error);
      setError(error.response?.data?.error || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Product Barcode Generator</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description (optional)"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link
            to="/display"
            className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
          >
            View All Products
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
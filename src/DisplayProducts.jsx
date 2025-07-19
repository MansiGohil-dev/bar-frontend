import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Display() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', description: '' });
  const [loading, setLoading] = useState(false);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
        setProducts(response.data);
        setFilteredProducts(response.data); // Initialize filtered products
        setError('');
      } catch (error) {
        console.error('Fetch products error:', error);
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handle search input change
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Handle form input changes for editing
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Start editing a product
  const handleEdit = (product) => {
    setEditProduct(product._id);
    setFormData({ name: product.name, price: product.price, description: product.description || '' });
  };

  // Close the modal
  const closeModal = () => {
    setEditProduct(null);
    setFormData({ name: '', price: '', description: '' });
    setError('');
  };

  // Update a product
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      setError('Name and price are required');
      return;
    }
    if (formData.price < 0) {
      setError('Price cannot be negative');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${editProduct}`, formData);
      const updatedProducts = products.map((p) => (p._id === editProduct ? response.data : p));
      setProducts(updatedProducts);
      setFilteredProducts(
        updatedProducts.filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      closeModal();
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Update product error:', error);
      setError(error.response?.data?.error || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  // Delete a product
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
      const updatedProducts = products.filter((p) => p._id !== id);
      setProducts(updatedProducts);
      setFilteredProducts(
        updatedProducts.filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setError('');
    } catch (error) {
      console.error('Delete product error:', error);
      setError(error.response?.data?.error || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  // Download barcode
  const handleDownloadBarcode = (barcode, productName) => {
    const link = document.createElement('a');
    link.href = barcode;
    link.download = `${productName}-barcode.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">All Products</h1>
        <Link to="/" className="inline-block mb-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
          Back to Add Product
        </Link>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Search by Product Name</label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter product name to search"
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {loading && <p className="text-gray-500 text-sm mb-4">Loading...</p>}
        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Price (₹)</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Barcode</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 && !loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-2 text-center">
                    {searchTerm ? 'No products match your search.' : 'No products available.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{prod.name}</td>
                    <td className="px-4 py-2">₹{prod.price.toFixed(2)}</td>
                    <td className="px-4 py-2">{prod.description || 'N/A'}</td>
                    <td className="px-4 py-2">
                      <img src={prod.barcode} alt={`Barcode for ${prod.name}`} className="w-32 h-16" />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(prod)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(prod._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600"
                          disabled={loading}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleDownloadBarcode(prod.barcode, prod.name)}
                          className="bg-purple-500 text-white px-2 py-1 rounded-md hover:bg-purple-600"
                          disabled={loading}
                        >
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {editProduct && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 custom-backdrop"
            aria-modal="true"
            role="dialog"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                aria-label="Close modal"
              >
                ✕
              </button>
              <h2 className="text-lg font-semibold mb-4">Edit Product</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter description (optional)"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Updating...' : 'Update Product'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <style>
        {`
          .custom-backdrop {
            background-color: rgba(0, 0, 0, 0.2);
          }
        `}
      </style>
    </div>
  );
}

export default Display;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', sku: '', category: '', unit_price: '', current_stock: '', min_stock_alert: '', location: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products', { params: { search } });
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', { ...form, unit_price: Number(form.unit_price), current_stock: Number(form.current_stock), min_stock_alert: Number(form.min_stock_alert) });
      setShowForm(false);
      setForm({ name: '', sku: '', category: '', unit_price: '', current_stock: '', min_stock_alert: '', location: '' });
      fetchProducts();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error creating product');
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '16px' }}>← Back to Dashboard</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Products</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#f4f6f8', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input placeholder="Product Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={{ padding: '8px' }} />
          <input placeholder="SKU *" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required style={{ padding: '8px' }} />
          <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ padding: '8px' }} />
          <input placeholder="Unit Price *" type="number" value={form.unit_price} onChange={e => setForm({...form, unit_price: e.target.value})} required style={{ padding: '8px' }} />
          <input placeholder="Current Stock" type="number" value={form.current_stock} onChange={e => setForm({...form, current_stock: e.target.value})} style={{ padding: '8px' }} />
          <input placeholder="Min Stock Alert" type="number" value={form.min_stock_alert} onChange={e => setForm({...form, min_stock_alert: e.target.value})} style={{ padding: '8px' }} />
          <input placeholder="Location/Warehouse" value={form.location} onChange={e => setForm({...form, location: e.target.value})} style={{ padding: '8px', gridColumn: 'span 2' }} />
          <button type="submit" style={{ padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', gridColumn: 'span 2' }}>
            Save Product
          </button>
        </form>
      )}

      <input
        placeholder="Search by name or SKU..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: '10px', width: '100%', marginBottom: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f6f8', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Name</th>
            <th style={{ padding: '10px' }}>SKU</th>
            <th style={{ padding: '10px' }}>Category</th>
            <th style={{ padding: '10px' }}>Price</th>
            <th style={{ padding: '10px' }}>Stock</th>
            <th style={{ padding: '10px' }}>Location</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{p.name}</td>
              <td style={{ padding: '10px' }}>{p.sku}</td>
              <td style={{ padding: '10px' }}>{p.category}</td>
              <td style={{ padding: '10px' }}>₹{p.unit_price}</td>
              <td style={{ padding: '10px', color: p.current_stock <= p.min_stock_alert ? 'red' : 'black' }}>{p.current_stock}</td>
              <td style={{ padding: '10px' }}>{p.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
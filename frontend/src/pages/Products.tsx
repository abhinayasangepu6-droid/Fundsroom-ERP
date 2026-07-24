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

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products', { params: { search } });
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

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

  const inputStyle = { padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* Header bar */}
      <div style={{ background: '#1e293b', color: 'white', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
            ← Dashboard
          </button>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>Products</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#cbd5e1' }}>{user.name} <span style={{ color: '#64748b' }}>({user.role})</span></span>
          <button onClick={handleLogout} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '0 32px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ background: 'white', padding: '10px 18px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Products</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{products.length}</div>
            </div>
            <div style={{ background: 'white', padding: '10px 18px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Low Stock</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>
                {products.filter(p => p.current_stock <= p.min_stock_alert).length}
              </div>
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '11px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <input placeholder="Product Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={inputStyle} />
            <input placeholder="SKU *" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required style={inputStyle} />
            <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inputStyle} />
            <input placeholder="Unit Price *" type="number" value={form.unit_price} onChange={e => setForm({...form, unit_price: e.target.value})} required style={inputStyle} />
            <input placeholder="Current Stock" type="number" value={form.current_stock} onChange={e => setForm({...form, current_stock: e.target.value})} style={inputStyle} />
            <input placeholder="Min Stock Alert" type="number" value={form.min_stock_alert} onChange={e => setForm({...form, min_stock_alert: e.target.value})} style={inputStyle} />
            <input placeholder="Location/Warehouse" value={form.location} onChange={e => setForm({...form, location: e.target.value})} style={{ ...inputStyle, gridColumn: 'span 2' }} />
            <button type="submit" style={{ padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', gridColumn: 'span 2', fontWeight: 600 }}>
              Save Product
            </button>
          </form>
        )}

        <input
          placeholder="🔍 Search by name or SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '12px 14px', width: '100%', marginBottom: '18px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }}
        />

        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>Name</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>SKU</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>Category</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>Price</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>Stock</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const low = p.current_stock <= p.min_stock_alert;
                return (
                  <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>{p.name}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{p.sku}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{p.category}</td>
                    <td style={{ padding: '14px 16px', color: '#1e293b' }}>₹{p.unit_price}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: low ? '#fef2f2' : '#f0fdf4', color: low ? '#dc2626' : '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>
                        {p.current_stock} {low && '⚠️'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{p.location}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Challans() {
  const navigate = useNavigate();
  const [challans, setChallans] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<{product_id: number, name: string, quantity: number, price: number}[]>([]);
  const [popup, setPopup] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchChallans = async () => {
    const res = await api.get('/challans');
    setChallans(res.data.challans);
  };

  const fetchDropdownData = async () => {
    const [custRes, prodRes] = await Promise.all([api.get('/customers'), api.get('/products')]);
    setCustomers(custRes.data.customers);
    setProducts(prodRes.data.products);
  };

  useEffect(() => { fetchChallans(); fetchDropdownData(); }, []);

  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => setPopup(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const addProductLine = () => {
    setSelectedProducts([...selectedProducts, { product_id: 0, name: '', quantity: 1, price: 0 }]);
  };

  const updateProductLine = (index: number, productId: number) => {
    const product = products.find(p => p.id === productId);
    const updated = [...selectedProducts];
    updated[index] = { product_id: productId, name: product?.name || '', quantity: updated[index].quantity, price: product?.unit_price || 0 };
    setSelectedProducts(updated);
  };

  const updateQuantity = (index: number, qty: number) => {
    const updated = [...selectedProducts];
    updated[index].quantity = qty;
    setSelectedProducts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || selectedProducts.length === 0) {
      setPopup({ type: 'error', message: 'Select a customer and at least one product' });
      return;
    }
    const totalQuantity = selectedProducts.reduce((sum, p) => sum + Number(p.quantity), 0);
    const challanNumber = `CH-${Date.now()}`;

    try {
      await api.post('/challans', {
        challan_number: challanNumber,
        customer_id: Number(customerId),
        products: selectedProducts,
        total_quantity: totalQuantity,
        status: 'Draft',
        created_by: user.id,
      });
      setShowForm(false);
      setCustomerId('');
      setSelectedProducts([]);
      fetchChallans();
      setPopup({ type: 'success', message: 'Challan created successfully!' });
    } catch (err: any) {
      setPopup({ type: 'error', message: err.response?.data?.error || 'Error creating challan' });
    }
  };

  const statusColor: Record<string, { bg: string; text: string }> = {
    Draft: { bg: '#fef9c3', text: '#854d0e' },
    Confirmed: { bg: '#f0fdf4', text: '#16a34a' },
    Cancelled: { bg: '#fef2f2', text: '#dc2626' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Segoe UI, sans-serif', position: 'relative' }}>

      {popup && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 1000, minWidth: '320px', maxWidth: '420px',
          background: popup.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${popup.type === 'error' ? '#fca5a5' : '#86efac'}`,
          borderLeft: `5px solid ${popup.type === 'error' ? '#dc2626' : '#16a34a'}`,
          borderRadius: '8px', padding: '16px 18px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'flex-start', gap: '12px',
        }}>
          <div style={{ fontSize: '20px' }}>{popup.type === 'error' ? '⚠️' : '✅'}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: popup.type === 'error' ? '#991b1b' : '#166534', marginBottom: '4px' }}>
              {popup.type === 'error' ? 'Error' : 'Success'}
            </div>
            <div style={{ fontSize: '14px', color: popup.type === 'error' ? '#7f1d1d' : '#14532d' }}>{popup.message}</div>
          </div>
          <button onClick={() => setPopup(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#666' }}>✕</button>
        </div>
      )}

      <div style={{ background: '#1e293b', color: 'white', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
            ← Dashboard
          </button>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>Sales Challans</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#cbd5e1' }}>{user.name} <span style={{ color: '#64748b' }}>({user.role})</span></span>
          <button onClick={handleLogout} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Logout</button>
        </div>
      </div>

      <div style={{ padding: '0 32px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ background: 'white', padding: '10px 18px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Challans</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{challans.length}</div>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '11px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
            {showForm ? 'Cancel' : '+ New Challan'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <select value={customerId} onChange={e => setCustomerId(e.target.value)} required style={{ padding: '10px', width: '100%', marginBottom: '14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
              <option value="">Select Customer *</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>)}
            </select>

            {selectedProducts.map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <select value={line.product_id} onChange={e => updateProductLine(i, Number(e.target.value))} style={{ padding: '10px', flex: 2, border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}>
                  <option value="0">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.unit_price})</option>)}
                </select>
                <input type="number" min="1" value={line.quantity} onChange={e => updateQuantity(i, Number(e.target.value))} style={{ padding: '10px', flex: 1, border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} placeholder="Qty" />
              </div>
            ))}

            <button type="button" onClick={addProductLine} style={{ padding: '9px 14px', marginBottom: '16px', cursor: 'pointer', border: '1px dashed #94a3b8', borderRadius: '6px', background: 'white', color: '#475569', fontSize: '13px' }}>
              + Add Product Line
            </button>
            <br />
            <button type="submit" style={{ padding: '12px 22px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
              Save Challan (Draft)
            </button>
          </form>
        )}

        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>Challan #</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>Customer ID</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>Total Qty</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>Status</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((c) => {
                const sc = statusColor[c.status] || statusColor.Draft;
                return (
                  <tr key={c.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>{c.challan_number}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{c.customer_id}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{c.total_quantity}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: sc.bg, color: sc.text, padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>{c.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{new Date(c.created_at).toLocaleDateString()}</td>
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
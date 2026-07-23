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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
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
      setPopup({ type: 'success', message: 'Challan created successfully! Stock updated.' });
    } catch (err: any) {
      setPopup({ type: 'error', message: err.response?.data?.error || 'Error creating challan' });
    }
  };

  return (
    <div style={{ padding: '30px', position: 'relative' }}>

      {popup && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 1000,
          minWidth: '320px',
          maxWidth: '420px',
          background: popup.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${popup.type === 'error' ? '#fca5a5' : '#86efac'}`,
          borderLeft: `5px solid ${popup.type === 'error' ? '#dc2626' : '#16a34a'}`,
          borderRadius: '8px',
          padding: '16px 18px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          animation: 'slideIn 0.25s ease-out',
        }}>
          <div style={{ fontSize: '20px', lineHeight: 1 }}>
            {popup.type === 'error' ? '⚠️' : '✅'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: popup.type === 'error' ? '#991b1b' : '#166534', marginBottom: '4px' }}>
              {popup.type === 'error' ? 'Insufficient Stock' : 'Success'}
            </div>
            <div style={{ fontSize: '14px', color: popup.type === 'error' ? '#7f1d1d' : '#14532d' }}>
              {popup.message}
            </div>
          </div>
          <button
            onClick={() => setPopup(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#666', padding: 0 }}
          >
            ✕
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '16px' }}>← Back to Dashboard</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Sales Challans</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ New Challan'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#f4f6f8', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <select value={customerId} onChange={e => setCustomerId(e.target.value)} required style={{ padding: '8px', width: '100%', marginBottom: '12px' }}>
            <option value="">Select Customer *</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>)}
          </select>

          {selectedProducts.map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
              <select value={line.product_id} onChange={e => updateProductLine(i, Number(e.target.value))} style={{ padding: '8px', flex: 2 }}>
                <option value="0">Select Product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.unit_price})</option>)}
              </select>
              <input type="number" min="1" value={line.quantity} onChange={e => updateQuantity(i, Number(e.target.value))} style={{ padding: '8px', flex: 1 }} placeholder="Qty" />
            </div>
          ))}

          <button type="button" onClick={addProductLine} style={{ padding: '8px 12px', marginBottom: '12px', cursor: 'pointer' }}>+ Add Product Line</button>
          <br />
          <button type="submit" style={{ padding: '10px 20px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Save Challan (Draft)
          </button>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f6f8', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Challan #</th>
            <th style={{ padding: '10px' }}>Customer ID</th>
            <th style={{ padding: '10px' }}>Total Qty</th>
            <th style={{ padding: '10px' }}>Status</th>
            <th style={{ padding: '10px' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {challans.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{c.challan_number}</td>
              <td style={{ padding: '10px' }}>{c.customer_id}</td>
              <td style={{ padding: '10px' }}>{c.total_quantity}</td>
              <td style={{ padding: '10px' }}>{c.status}</td>
              <td style={{ padding: '10px' }}>{new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
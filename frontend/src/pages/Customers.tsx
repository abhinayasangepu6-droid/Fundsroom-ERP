import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', mobile: '', email: '', business_name: '',
    customer_type: 'Retail', address: '', status: 'Lead', notes: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers', { params: { search } });
      setCustomers(res.data.customers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchCustomers(); }, [search]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', form);
      setShowForm(false);
      setForm({ name: '', mobile: '', email: '', business_name: '', customer_type: 'Retail', address: '', status: 'Lead', notes: '' });
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error creating customer');
    }
  };

  const inputStyle = { padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' };

  const statusColor: Record<string, { bg: string; text: string }> = {
    Lead: { bg: '#fef9c3', text: '#854d0e' },
    Active: { bg: '#f0fdf4', text: '#16a34a' },
    Inactive: { bg: '#fef2f2', text: '#dc2626' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Segoe UI, sans-serif' }}>

      <div style={{ background: '#1e293b', color: 'white', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
            ← Dashboard
          </button>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>Customers</div>
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
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Total Customers</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{customers.length}</div>
            </div>
            <div style={{ background: 'white', padding: '10px 18px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Active</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#16a34a' }}>
                {customers.filter(c => c.status === 'Active').length}
              </div>
            </div>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '11px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
            {showForm ? 'Cancel' : '+ Add Customer'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <input placeholder="Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={inputStyle} />
            <input placeholder="Mobile *" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} required style={inputStyle} />
            <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={inputStyle} />
            <input placeholder="Business Name" value={form.business_name} onChange={e => setForm({...form, business_name: e.target.value})} style={inputStyle} />
            <select value={form.customer_type} onChange={e => setForm({...form, customer_type: e.target.value})} style={inputStyle}>
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
              <option value="Distributor">Distributor</option>
            </select>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={inputStyle}>
              <option value="Lead">Lead</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <input placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={{ ...inputStyle, gridColumn: 'span 2' }} />
            <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} style={{ ...inputStyle, gridColumn: 'span 2', fontFamily: 'inherit' }} />
            <button type="submit" style={{ padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', gridColumn: 'span 2', fontWeight: 600 }}>
              Save Customer
            </button>
          </form>
        )}

        <input
          placeholder="🔍 Search by name, mobile, email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '12px 14px', width: '100%', marginBottom: '18px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }}
        />

        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>Name</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>Mobile</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>Business</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>Type</th>
                <th style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => {
                const sc = statusColor[c.status] || statusColor.Lead;
                return (
                  <tr key={c.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>{c.name}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{c.mobile}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{c.business_name}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{c.customer_type}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: sc.bg, color: sc.text, padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 700 }}>
                        {c.status}
                      </span>
                    </td>
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
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

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers', { params: { search } });
      setCustomers(res.data.customers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

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

  return (
    <div style={{ padding: '30px' }}>
      <button onClick={() => navigate('/dashboard')} style={{ marginBottom: '16px' }}>← Back to Dashboard</button>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Customers</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ Add Customer'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#f4f6f8', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input placeholder="Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={{ padding: '8px' }} />
          <input placeholder="Mobile *" value={form.mobile} onChange={e => setForm({...form, mobile: e.target.value})} required style={{ padding: '8px' }} />
          <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ padding: '8px' }} />
          <input placeholder="Business Name" value={form.business_name} onChange={e => setForm({...form, business_name: e.target.value})} style={{ padding: '8px' }} />
          <select value={form.customer_type} onChange={e => setForm({...form, customer_type: e.target.value})} style={{ padding: '8px' }}>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Distributor">Distributor</option>
          </select>
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ padding: '8px' }}>
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <input placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={{ padding: '8px', gridColumn: 'span 2' }} />
          <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} style={{ padding: '8px', gridColumn: 'span 2' }} />
          <button type="submit" style={{ padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', gridColumn: 'span 2' }}>
            Save Customer
          </button>
        </form>
      )}

      <input
        placeholder="Search by name, mobile, email..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: '10px', width: '100%', marginBottom: '16px', border: '1px solid #ccc', borderRadius: '4px' }}
      />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f6f8', textAlign: 'left' }}>
            <th style={{ padding: '10px' }}>Name</th>
            <th style={{ padding: '10px' }}>Mobile</th>
            <th style={{ padding: '10px' }}>Business</th>
            <th style={{ padding: '10px' }}>Type</th>
            <th style={{ padding: '10px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{c.name}</td>
              <td style={{ padding: '10px' }}>{c.mobile}</td>
              <td style={{ padding: '10px' }}>{c.business_name}</td>
              <td style={{ padding: '10px' }}>{c.customer_type}</td>
              <td style={{ padding: '10px' }}>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
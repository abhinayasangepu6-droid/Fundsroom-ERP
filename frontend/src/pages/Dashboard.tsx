import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const modules = [
    { title: 'Customers', desc: 'Manage your CRM contacts', icon: '👥', color: '#2563eb', path: '/customers' },
    { title: 'Products', desc: 'Inventory and stock levels', icon: '📦', color: '#16a34a', path: '/products' },
    { title: 'Sales Challans', desc: 'Create and track challans', icon: '📄', color: '#d97706', path: '/challans' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f8', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ background: '#111827', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: 'white', margin: 0, fontWeight: 600, letterSpacing: '0.5px' }}>Fundsroom ERP</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#d1d5db', fontSize: '14px' }}>{user.name} · {user.role}</span>
          <button
            onClick={handleLogout}
            style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: '50px 40px' }}>
        <h1 style={{ fontSize: '26px', marginBottom: '6px', color: '#111827' }}>Welcome back, {user.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: '#6b7280', marginBottom: '36px' }}>Choose a module to get started</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', maxWidth: '900px' }}>
          {modules.map((m) => (
            <div
              key={m.title}
              onClick={() => navigate(m.path)}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '28px 24px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{m.icon}</div>
              <h3 style={{ margin: '0 0 6px', fontSize: '18px', color: '#111827' }}>{m.title}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{m.desc}</p>
              <div style={{ marginTop: '16px', fontSize: '13px', fontWeight: 600, color: m.color }}>Open →</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
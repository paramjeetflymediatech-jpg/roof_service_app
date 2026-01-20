import { useEffect, useState } from 'react';
import Layout from '@/components/LayoutShell';
import apiClient from '@/lib/apiClient';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiClient.get('/leads');
        setLeads(res.data.items || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load leads');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <Layout>
      <h2>Admin - Leads</h2>
      {loading && <p>Loading leads...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && leads.length === 0 && <p>No leads yet.</p>}

      {!loading &&
        !error &&
        leads.map((lead) => (
          <div key={lead._id} className="card">
            <h3>{lead.name}</h3>
            {lead.email && <p>Email: {lead.email}</p>}
            {lead.phone && <p>Phone: {lead.phone}</p>}
            {lead.leadType && <p>Type: {lead.leadType}</p>}
            {lead.status && <p>Status: {lead.status}</p>}
            {lead.message && <p>{lead.message}</p>}
            <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              Created: {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : 'N/A'}
            </p>
          </div>
        ))}
    </Layout>
  );
}

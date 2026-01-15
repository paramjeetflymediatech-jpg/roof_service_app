import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import apiClient from '@/lib/apiClient';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiClient.get('/services');
        setServices(res.data.items || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <Layout>
      <h2>Our Services</h2>
      {loading && <p>Loading services...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && services.length === 0 && <p>No services found.</p>}
      {!loading &&
        !error &&
        services.map((service) => (
          <div key={service._id} className="card">
            <h3>{service.name}</h3>
            {service.shortDescription && <p>{service.shortDescription}</p>}
            <p>Status: {service.status}</p>
          </div>
        ))}
    </Layout>
  );
}

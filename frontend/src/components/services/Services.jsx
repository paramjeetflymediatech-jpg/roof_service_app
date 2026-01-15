import React, { useEffect, useState } from 'react';
import { fetchServices } from '../../api/services.api';

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchServices();
        setServices(data.items || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <p>Loading services...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div>
      <h2>Our Services</h2>
      {services.length === 0 && <p>No services found.</p>}
      {services.map((service) => (
        <div key={service._id} className="card">
          <h3>{service.name}</h3>
          {service.shortDescription && <p>{service.shortDescription}</p>}
          <p>Status: {service.status}</p>
        </div>
      ))}
    </div>
  );
}

export default Services;

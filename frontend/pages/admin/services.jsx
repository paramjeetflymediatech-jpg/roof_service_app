import { useEffect, useState } from 'react';
import Layout from '@/components/LayoutShell';
import apiClient from '@/lib/apiClient';

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', shortDescription: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadServices() {
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

  useEffect(() => {
    loadServices();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.slug) {
      setError('Name and slug are required');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/services', {
        name: form.name,
        slug: form.slug,
        shortDescription: form.shortDescription,
        status: 'published',
      });
      setSuccess('Service created');
      setForm({ name: '', slug: '', shortDescription: '' });
      setServices((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <Layout>
      <h2>Admin - Services</h2>

      <section className="card" style={{ marginBottom: 24 }}>
        <h3>Create Service</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="label" htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              className="input"
              value={form.name}
              onChange={handleChange}
              placeholder="Roof Repair"
            />
          </div>

          <div className="form-row">
            <label className="label" htmlFor="slug">Slug</label>
            <input
              id="slug"
              name="slug"
              className="input"
              value={form.slug}
              onChange={handleChange}
              placeholder="roof-repair"
            />
          </div>

          <div className="form-row">
            <label className="label" htmlFor="shortDescription">Short Description</label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              className="textarea"
              rows={3}
              value={form.shortDescription}
              onChange={handleChange}
              placeholder="Fast and reliable roof repair services"
            />
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p style={{ color: '#047857', fontSize: '0.9rem' }}>{success}</p>}

          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Create Service'}
          </button>
        </form>
      </section>

      <section>
        <h3>Existing Services</h3>
        {loading && services.length === 0 ? (
          <p>Loading services...</p>
        ) : services.length === 0 ? (
          <p>No services yet.</p>
        ) : (
          services.map((service) => (
            <div key={service._id} className="card">
              <h4>{service.name}</h4>
              <p>Slug: {service.slug}</p>
              {service.shortDescription && <p>{service.shortDescription}</p>}
              <p>Status: {service.status}</p>
            </div>
          ))
        )}
      </section>
    </Layout>
  );
}

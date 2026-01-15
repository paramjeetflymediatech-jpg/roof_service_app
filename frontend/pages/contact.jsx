import { useState } from 'react';
import Layout from '@/components/Layout';
import apiClient from '@/lib/apiClient';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name) {
      setError('Name is required');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/leads', {
        leadType: 'contact',
        source: 'website',
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      });
      setSuccess('Thank you! We have received your request.');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <h2>Contact / Request a Quote</h2>
      <section className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="label" htmlFor="name">Name *</label>
            <input
              id="name"
              name="name"
              className="input"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-row">
            <label className="label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-row">
            <label className="label" htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              className="input"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 555 123 4567"
            />
          </div>

          <div className="form-row">
            <label className="label" htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              className="textarea"
              rows={4}
              value={form.message}
              onChange={handleChange}
              placeholder="Describe your roofing or renovation needs"
            />
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p style={{ color: '#047857', fontSize: '0.9rem' }}>{success}</p>}

          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Request'}
          </button>
        </form>
      </section>
    </Layout>
  );
}

import Link from 'next/link';
import Layout from '@/components/Layout';

export default function HomePage() {
  return (
    <Layout>
      <section className="card" style={{ marginBottom: 24 }}>
        <h2>Welcome to Roof Service</h2>
        <p>
          Professional roofing, renovation and repair services. Get a quote, explore our
          services and manage content via the admin panel.
        </p>
        <Link href="/services" className="button">
          View Services
        </Link>
      </section>

      <section className="card">
        <h3>Admin Demo</h3>
        <p>
          Use the Admin Services page to create and manage services stored in MongoDB via
          your Node.js API.
        </p>
        <Link href="/admin/services" className="button">
          Go to Admin Services
        </Link>
      </section>
    </Layout>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <section className="card" style={{ marginBottom: 24 }}>
        <h2>Welcome to Roof Service</h2>
        <p>
          Professional roofing, renovation and repair services. Get a quote, explore our
          services and manage content via the admin panel.
        </p>
        <Link to="/services" className="button">
          View Services
        </Link>
      </section>

      <section className="card">
        <h3>Admin Demo</h3>
        <p>
          Use the Admin Services page to create and manage services stored in MongoDB via
          your Node.js API.
        </p>
        <Link to="/admin/services" className="button">
          Go to Admin Services
        </Link>
      </section>
    </div>
  );
}

export default Home;

import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <h1 className="logo">Roof Service</h1>
          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/admin/services">Admin Services</Link>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">{children}</div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} Roof Service. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

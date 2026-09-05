import '@/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { Inter, Poppins } from 'next/font/google';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const ToastContainer = dynamic(
  () => import('react-toastify').then((mod) => mod.ToastContainer),
  { ssr: false }
);

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

export default function MyApp({ Component, pageProps }) {
  return (
    <div className={`${inter.variable} ${poppins.variable} font-sans min-h-screen`}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/assets/roofing-logo.png" type="image/png" />
        <title>Mainstreet Roofing Ltd</title>
      </Head>
      <Component {...pageProps} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

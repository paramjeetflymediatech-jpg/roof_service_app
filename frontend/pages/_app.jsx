import '@/styles/globals.css';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={router.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Component {...pageProps} />
      </motion.div>
    </AnimatePresence>
  );
}


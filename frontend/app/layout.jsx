import '@/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import LayoutShell from '@/components/LayoutShell';
import { ToastContainer } from 'react-toastify';

export const metadata = {
    title: 'Premium Roofing',
    description: 'Premium Roofing Solutions',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body suppressHydrationWarning={true}>
                <LayoutShell>{children}</LayoutShell>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
            </body>
        </html>
    );
}

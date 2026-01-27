import Layout from '@/components/LayoutShell';
import QuoteForm from '@/components/QuoteForm';

import SeoHead from '@/components/SeoHead';
import { getSeoData } from '@/lib/api/seo';

export async function getServerSideProps() {
    try {
        const data = await getSeoData('contact');
        return {
            props: {
                seoData: data.success ? data.data : null,
            },
        };
    } catch (error) {
        console.error('Error fetching Contact SEO data:', error);
        return {
            props: {
                seoData: null,
            },
        };
    }
}

export default function ContactPage({ seoData }) {
    return (
        <Layout>
            <SeoHead pageName="contact" initialSeoData={seoData} />
            <div className="min-h-screen">
                <QuoteForm />
            </div>
        </Layout>
    );
}

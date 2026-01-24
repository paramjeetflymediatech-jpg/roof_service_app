import Head from 'next/head';
import { useSeo } from '@/hooks/useSeo';

const SeoHead = ({ pageName }) => {
    const { seoData, loading, error } = useSeo(pageName);

    if (loading) {
        return (
            <Head>
                <title>Loading...</title>
            </Head>
        );
    }

    if (error || !seoData) {
        return (
            <Head>
                <title>Mainstreet Roofing Ltd</title>
                <meta name="description" content="Quality materials designed to protect your investment for decades." />
            </Head>
        );
    }

    return (
        <Head>
            <title>{seoData.pageTitle}</title>
            <meta name="description" content={seoData.metaDescription} />
            <meta name="robots" content={seoData.metaRobots} />

            {/* Open Graph */}
            <meta property="og:title" content={seoData.ogTitle} />
            <meta property="og:description" content={seoData.ogDescription} />
            {seoData.ogImage && <meta property="og:image" content={seoData.ogImage} />}

            {/* Canonical */}
            {seoData.canonicalUrl && <link rel="canonical" href={seoData.canonicalUrl} />}
        </Head>
    );
};

export default SeoHead;

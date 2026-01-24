import { useEffect, useState } from 'react';

export const useSeo = (pageName) => {
    const [seoData, setSeoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!pageName) return;

        const fetchSeoData = async () => {
            try {
                setLoading(true);
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const response = await fetch(`${apiUrl}/api/seo/${pageName}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch SEO data');
                }

                const result = await response.json();

                if (result.success) {
                    setSeoData(result.data);
                    updateMetaTags(result.data);
                }
            } catch (err) {
                console.error('SEO fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSeoData();
    }, [pageName]);

    const updateMetaTags = (data) => {
        if (typeof document === 'undefined') return;

        // Update title
        document.title = data.pageTitle;

        // Update or create meta tags
        updateMetaTag('description', data.metaDescription);
        updateMetaTag('robots', data.metaRobots);

        // Update Open Graph tags
        updateMetaTag('og:title', data.ogTitle, 'property');
        updateMetaTag('og:description', data.ogDescription, 'property');
        updateMetaTag('og:image', data.ogImage, 'property');

        // Update canonical URL
        if (data.canonicalUrl) {
            updateCanonicalLink(data.canonicalUrl);
        }
    };

    const updateMetaTag = (name, content, attribute = 'name') => {
        if (!content) return;

        let element = document.querySelector(`meta[${attribute}="${name}"]`);

        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attribute, name);
            document.head.appendChild(element);
        }

        element.setAttribute('content', content);
    };

    const updateCanonicalLink = (url) => {
        let link = document.querySelector('link[rel="canonical"]');

        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'canonical');
            document.head.appendChild(link);
        }

        link.setAttribute('href', url);
    };

    return { seoData, loading, error };
};

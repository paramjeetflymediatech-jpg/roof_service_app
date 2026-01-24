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

    return { seoData, loading, error };
};

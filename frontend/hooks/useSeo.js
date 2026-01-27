import { useState, useEffect } from 'react';
import { getSeoData } from '@/lib/api/seo';

export const useSeo = (pageName, options = {}) => {
    const [seoData, setSeoData] = useState(null);
    const [loading, setLoading] = useState(!options.skip);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!pageName || options.skip) return;

        const fetchSeoData = async () => {
            try {
                setLoading(true);
                const data = await getSeoData(pageName);

                if (data.success) {
                    setSeoData(data.data);
                }
            } catch (err) {
                console.error('SEO fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSeoData();
    }, [pageName, options.skip]);

    return { seoData, loading, error };
};

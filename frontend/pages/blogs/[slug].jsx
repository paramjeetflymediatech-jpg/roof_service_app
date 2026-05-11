'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import LayoutShell from '@/components/LayoutShell';
import SeoHead from '@/components/SeoHead';
import { getBlogBySlug } from '@/lib/api/blog';

export async function getServerSideProps({ params }) {
    const { slug } = params;
    const data = await getBlogBySlug(slug);

    if (!data.success || !data.data) {
        return {
            notFound: true,
        };
    }

    // Transform blog data to SEO format
    const blog = data.data;
    const seoData = {
        pageTitle: blog.metaTitle || blog.title || null,
        metaDescription: blog.metaDescription || blog.excerpt || null,
        metaRobots: blog.metaRobots || 'index, follow',
        ogTitle: blog.ogTitle || blog.metaTitle || blog.title || null,
        ogDescription: blog.ogDescription || blog.metaDescription || blog.excerpt || null,
        ogImage: blog.ogImage || blog.image || null,
        canonicalUrl: blog.canonicalUrl || null,
        schemaMarkup: blog.schemaMarkup || null,
        googleAnalyticsId: blog.googleAnalyticsId || null,
        googleTagManagerId: blog.googleTagManagerId || null
    };

    return {
        props: {
            blog,
            seoData,
        },
    };
}

export default function BlogPost({ blog, seoData }) {
    const router = useRouter();

    if (router.isFallback) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <LayoutShell>
            <SeoHead pageName={`blog-${blog.slug}`} initialSeoData={seoData} />

            {/* Article Header */}
            <div className="bg-white pt-20 pb-8 md:pt-28 md:pb-16 border-b border-gray-100">
                <div className="container-custom max-w-4xl px-4 md:px-6">
                    <div className="mb-4 md:mb-6 flex flex-wrap gap-2">
                        {blog.tags && blog.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 text-xs md:text-sm font-medium bg-primary-50 text-primary-700 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight md:leading-tight break-words">
                        {blog.title}
                    </h1>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-gray-500 text-sm border-t border-gray-100 pt-6 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{blog.author || 'Mainstreet Roofing'}</p>
                                <p>Author</p>
                            </div>
                        </div>
                        <div className="hidden sm:block h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 sm:hidden bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p>Published</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Image */}
            {blog.image && (
                <div className="container-custom max-w-5xl mx-auto px-4 md:px-6 mb-12">
                    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden">
                        <img src={blog.image} alt={blog.title} className="w-full h-full object-contain" />
                    </div>
                </div>
            )}

            {/* Content */}
            <article className="py-12 md:py-20 bg-white">
                <div className="container-custom max-w-3xl px-4 md:px-6">
                    <div
                        className="prose prose-base md:prose-lg lg:prose-xl prose-indigo mx-auto text-gray-700 break-words"
                        dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }}
                    />

                    {/* Share / Tags Footer */}
                    <div className="mt-12 md:mt-16 pt-8 border-t border-gray-200 flex justify-between items-center">
                        <Link href="/blogs">
                            <button className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-2 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Articles
                            </button>
                        </Link>
                    </div>
                </div>
            </article>

        </LayoutShell>
    );
}

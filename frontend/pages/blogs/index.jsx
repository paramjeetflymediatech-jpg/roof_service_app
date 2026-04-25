'use client';

import { motion } from 'framer-motion';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LayoutShell from '@/components/LayoutShell';
import SeoHead from '@/components/SeoHead';
import { getBlogs } from '@/lib/api/blog';
import { getSeoData } from '@/lib/api/seo';

export async function getServerSideProps() {
    try {
        const [blogsResponse, seoResponse] = await Promise.allSettled([
            getBlogs({ limit: 100 }), // Fetch more items for client-side pagination
            getSeoData('blogs')
        ]);

        const blogs = blogsResponse.status === 'fulfilled' && blogsResponse.value.success
            ? blogsResponse.value.data
            : [];

        const seoData = seoResponse.status === 'fulfilled' && seoResponse.value.success
            ? seoResponse.value.data
            : null;

        return {
            props: {
                blogs,
                seoData,
            },
        };
    } catch (error) {
        console.error('Error in blog getServerSideProps:', error);
        return {
            props: {
                blogs: [],
                seoData: null,
            },
        };
    }
}

export default function BlogPage({ blogs, seoData }) {
    const [showAll, setShowAll] = React.useState(false);

    // Show only first 6 items unless showAll is true
    const visibleBlogs = showAll ? blogs : blogs.slice(0, 6);

    return (
        <LayoutShell>
            <SeoHead pageName="blog" initialSeoData={seoData} />

            {/* Hero Banner */}
            <div className="relative h-auto min-h-[20rem] md:h-80 bg-slate-900 flex items-center justify-center overflow-hidden py-12 md:py-0">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-slate-900 opacity-90"></div>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('/images/pattern.png')" }}></div>

                <div className="relative z-10 text-center text-white px-4 container mx-auto">
                    <motion.h1
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Our Blog
                    </motion.h1>
                    <motion.p
                        className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Insights, tips, and news about roofing and home maintenance.
                    </motion.p>
                </div>
            </div>

            {/* Blog List Section */}
            <section className="py-12 md:py-20 lg:py-24 bg-gray-50 min-h-screen">
                <div className="container-custom px-4 sm:px-6 lg:px-8">

                    {blogs.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="inline-block p-6 rounded-full bg-gray-200 mb-4 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-gray-900">No proper posts yet</h3>
                            <p className="text-gray-500 mt-2">Check back soon for latest updates!</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
                                {visibleBlogs.map((blog, index) => (
                                    <motion.div
                                        key={blog._id || blog.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <Link href={`/blogs/${blog.slug}`}>
                                            <div className="group bg-white rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100">
                                                <div className="relative h-56 sm:h-48 md:h-56 lg:h-64 w-full bg-gray-200 overflow-hidden">
                                                    {blog.image ? (
                                                        <img
                                                            src={blog.image}
                                                            alt={blog.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-10">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 right-4">
                                                        {blog.tags && blog.tags.slice(0, 1).map(tag => (
                                                            <span key={tag} className="px-3 py-1 text-xs font-semibold bg-white/90 text-primary-700 rounded-full shadow-sm backdrop-blur-sm">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="p-5 md:p-6 lg:p-7 flex-1 flex flex-col">
                                                    <div className="flex items-center text-xs text-gray-500 mb-3 space-x-2">
                                                        <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                        <span>•</span>
                                                        <span>5 min read</span>
                                                    </div>

                                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                                                        {blog.title}
                                                    </h3>

                                                    <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-3 flex-1">
                                                        {blog.excerpt || 'Read this article to learn more...'}
                                                    </p>

                                                    <div className="flex items-center text-primary-600 font-medium text-sm mt-auto group-hover:translate-x-1 transition-transform">
                                                        Read Article
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {!showAll && blogs.length > 6 && (
                                <div className="mt-12 text-center">
                                    <button
                                        onClick={() => setShowAll(true)}
                                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-accent-600 hover:bg-accent-700 md:text-lg md:px-10 transition-colors duration-300 shadow-md hover:shadow-lg"
                                    >
                                        View All Posts
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </LayoutShell>
    );
}

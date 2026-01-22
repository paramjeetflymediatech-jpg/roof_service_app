"use client";

import { Home, Droplet, BookOpen } from "lucide-react";

export default function OurProcess() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center">

                {/* Heading */}
                <p className="text-sm font-semibold tracking-widest text-[#ea580c] uppercase">
                    Our Process
                </p>
                <h2 className="text-4xl font-bold text-[#ea580c] mt-3">
                    What are Roofing Services
                </h2>

                {/* Cards */}
                <div className="relative mt-20 grid grid-cols-1 md:grid-cols-3 gap-16">

                    {/* Card 1 */}
                    <div className="relative bg-[#ea580c] p-12 rounded-md text-center transition hover:-translate-y-3 hover:shadow-2xl">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                            1
                        </div>

                        <div className="mx-auto mb-6 w-20 h-20 bg-white rounded-full flex items-center justify-center">
                            <Home size={36} className="text-[#ea580c]" />
                        </div>

                        <h3 className="text-white text-xl font-semibold">
                            Metal roofing
                        </h3>

                        {/* Arrow */}
                        <svg
                            className="hidden md:block absolute top-1/2 -right-20"
                            width="140"
                            height="60"
                            viewBox="0 0 140 60"
                            fill="none"
                        >
                            <path
                                d="M0 30 C 40 0, 100 0, 140 30"
                                stroke="#555"
                                strokeWidth="2"
                                strokeDasharray="5 5"
                                fill="none"
                            />
                        </svg>
                    </div>

                    {/* Card 2 */}
                    <div className="relative bg-[#ea580c] p-12 rounded-md text-center transition hover:-translate-y-3 hover:shadow-2xl">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                            2
                        </div>

                        <div className="mx-auto mb-6 w-20 h-20 bg-white rounded-full flex items-center justify-center">
                            <Droplet size={36} className="text-[#ea580c]" />
                        </div>

                        <h3 className="text-white text-xl font-semibold">
                            Leak repair
                        </h3>

                        {/* Arrow */}
                        <svg
                            className="hidden md:block absolute top-1/2 -right-20"
                            width="140"
                            height="60"
                            viewBox="0 0 140 60"
                            fill="none"
                        >
                            <path
                                d="M0 30 C 40 60, 100 60, 140 30"
                                stroke="#555"
                                strokeWidth="2"
                                strokeDasharray="5 5"
                                fill="none"
                            />
                        </svg>
                    </div>

                    {/* Card 3 */}
                    <div className="relative bg-[#ea580c] p-12 rounded-md text-center transition hover:-translate-y-3 hover:shadow-2xl">
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                            3
                        </div>

                        <div className="mx-auto mb-6 w-20 h-20 bg-white rounded-full flex items-center justify-center">
                            <BookOpen size={36} className="text-[#ea580c]" />
                        </div>

                        <h3 className="text-white text-xl font-semibold">
                            Torch on
                        </h3>
                    </div>

                </div>
            </div>
        </section>
    );
}

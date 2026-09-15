"use client";

import Image from "next/image";
import { ClipboardList, Search, FileText, Hammer, CheckCircle2 } from "lucide-react";

const processSteps = [
    {
        step: 1,
        title: "Free Consultation",
        description: "We meet with you to assess your roofing needs, preferences, and project goals.",
        image: "/assets/process/process-1.png",
        icon: ClipboardList,
    },
    {
        step: 2,
        title: "Inspection",
        description: "Certified experts conduct a detailed on-site roof inspection and structural evaluation.",
        image: "/assets/process/process-2.png",
        icon: Search,
    },
    {
        step: 3,
        title: "Transparent Quote",
        description: "You receive a clear, itemized proposal detailing materials, scope, and upfront pricing.",
        image: "/assets/process/process-3.png",
        icon: FileText,
    },
    {
        step: 4,
        title: "Expert Installation/Repair",
        description: "Our skilled roofing crew installs high-quality materials adhering to strict safety standards.",
        image: "/assets/process/process-4.png",
        icon: Hammer,
    },
    {
        step: 5,
        title: "Final Walkthrough",
        description: "We conduct a comprehensive quality inspection and walkthrough to ensure 100% satisfaction.",
        image: "/assets/process/process-5.png",
        icon: CheckCircle2,
    },
];

export default function OurProcess() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center">

                {/* Heading */}
                <p className="text-sm font-semibold tracking-widest text-[#ea580c] uppercase">
                    Our Process
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mt-3">
                    How We Deliver <span className="text-[#ea580c]">Excellence</span>
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto mt-3 text-sm md:text-base">
                    From your initial consultation to the final quality inspection, our proven 5-step process ensures a hassle-free roofing experience.
                </p>

                {/* Cards Grid */}
                <div className="relative mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {processSteps.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.step}
                                className="relative group bg-[#ea580c] p-5 rounded-2xl text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between"
                            >
                                {/* Step Number Badge */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-9 h-9 bg-black text-white border-2 border-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg z-20">
                                    {item.step}
                                </div>

                                <div>
                                    {/* Image Container */}
                                    <div className="relative w-full h-44 rounded-xl overflow-hidden mb-4 mt-2 bg-black/10 shadow-inner">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                                            className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                                        {/* Floating Icon inside Image */}
                                        <div className="absolute bottom-2 right-2 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
                                            <Icon size={16} className="text-[#ea580c]" />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-white text-lg font-bold tracking-tight mb-2">
                                        {item.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-white/90 text-xs leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Step Indicator Footer */}
                                <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-center gap-1.5 text-white/80 text-xs font-medium">
                                    <span>Step {item.step} of 5</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

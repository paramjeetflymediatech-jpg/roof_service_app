import Image from "next/image";

export default function Secondsechome() {
    return (
        <section className="py-16 lg:py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* LEFT – IMAGE COLLAGE */}
                    <div className="relative w-full flex justify-center lg:justify-start">

                        {/* Dotted Pattern */}
                        <div className="absolute left-0 bottom-0 w-32 h-32 lg:w-40 lg:h-40
              bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]
              [background-size:10px_10px]">
                        </div>

                        {/* MAIN TALL IMAGE */}
                        <div className="relative 
              w-[280px] sm:w-[320px] md:w-[360px] lg:w-[380px]
              rounded-xl overflow-hidden shadow-xl">
                            <img
                                src="/assets/aw-about-1.jpg"
                                alt="About Us"
                                className="w-full h-auto object-cover"
                            />

                            {/* White Inner Border */}
                            <div className="absolute inset-4 sm:inset-5 md:inset-6 border border-white z-10"></div>
                        </div>

                        {/* SECOND IMAGE (BOTTOM RIGHT OVERLAP) */}
                        <div className="absolute 
              -bottom-12 sm:-bottom-14 md:-bottom-16
              right-1/2 sm:right-8 lg:right-0 translate-x-1/2 sm:translate-x-0
              w-[220px] sm:w-[260px] md:w-[300px] lg:w-[320px]
              h-[200px] sm:h-[220px] md:h-[260px] lg:h-[280px]
              rounded-xl overflow-hidden shadow-2xl border-8 border-white bg-white">
                            <Image
                                src="/assets/aw-about-2.jpg"
                                alt="Roof"
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* EXPERIENCE BADGE */}
                        <div className="absolute 
              bottom-4 sm:bottom-6 lg:bottom-0
              right-1/2 sm:right-10 lg:right-0 translate-x-1/2 sm:translate-x-0
              bg-white shadow-xl rounded-lg
              px-4 sm:px-6 py-3 sm:py-4
              flex items-center gap-3 sm:gap-4 z-10">
                            <span className="text-3xl sm:text-4xl font-bold text-yellow-600">20</span>
                            <div className="text-xs sm:text-sm">
                                <p className="font-semibold text-gray-900">Years</p>
                                <p className="text-gray-500">Running Business</p>
                            </div>
                        </div>

                        {/* DECORATIVE SHAPES */}
                        <div className="hidden sm:block absolute top-6 right-24 w-8 h-8 bg-yellow-500 rounded-md rotate-12"></div>
                        <div className="hidden sm:block absolute top-20 right-6 w-10 h-10 bg-black rounded-md rotate-6"></div>

                    </div>

                    {/* RIGHT – CONTENT */}
                    <div className="text-center lg:text-left">

                        {/* <p className="text-yellow-600 font-semibold mb-3 tracking-wide">
                            ABOUT US
                        </p> */}

                        <h2 className="text-3xl sm:text-4xl lg:text-4xl font-bold text-gray-900 leading-tight mb-8">
                            <span className="text-accent-400">Secure Your House:</span> Strong Roofing Services By Mainstreet Roofing
                        </h2>

                        <div className="h-px bg-gray-200 mb-6"></div>

                        <p className="text-gray-600 leading-relaxed mb-6 text-justify">
                            Worrying about your house’s security from external elements? The professionals of Mainstreet Roofing have you covered in terms of providing you with a strong and durable roof system. By engaging with an expert roofing contractor in Surrey, you can make sure that the roofing system of your residential or commercial areas is secured in a proper and efficient manner, thus providing you with peace of mind regarding the protection of your house from harsh weather conditions such as storms or rain.

                        </p>

                        <p className="text-gray-600 leading-relaxed mb-10 text-justify">
                            Our experts are highly qualified and well-trained in providing you with the proper installation of roof systems with the comprehensive use of high-quality materials. From fixing the old damage to installing the new roofs, our commitment to workmanship is strong and firm.

                        </p>

                        <div className="h-px bg-gray-200 mb-8"></div>

                        {/* Features */}
                        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 justify-center lg:justify-start">
                            <div className="flex items-center gap-3">
                                <span className="text-yellow-600 text-2xl">👷</span>
                                <p className="font-semibold text-gray-900">Expert Team</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-yellow-600 text-2xl">😊</span>
                                <p className="font-semibold text-gray-900">
                                    100% Satisfaction
                                </p>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}

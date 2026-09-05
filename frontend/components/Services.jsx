import React from "react";
import Link from "next/link";
import { SERVICES } from "@/lib/constants";
import ServiceCard from "./ServiceCard";

export default function Services({ services = [] }) {
  // Fallback to empty array if services is undefined
  const displayServices = services && services.length > 0 ? services : SERVICES;

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
            Get Customized{" "}
            <span className="gradient-text">
              Roofing Services According your needs.
            </span>
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service, index) => (
            <ServiceCard
              key={service.id || service.slug}
              title={service.title || service.name}
              description={service.description || service.shortDescription}
              icon={service.icon}
              features={service.features || []}
              index={index}
              link={`/services/${service.slug}`}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-700 mb-6">
            Don't see what you're looking for? We offer custom solutions for
            unique roofing needs.
          </p>
          <Link href="/contact" className="btn btn-primary text-lg">
            Request Custom Quote
          </Link>
        </div>
      </div>
    </section>
  );
}

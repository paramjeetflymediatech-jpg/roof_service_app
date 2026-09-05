import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { submitLead } from "@/lib/api/leads";
import { getServices } from "@/lib/api/service";

export default function QuoteForm({ initialCity = "" }) {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: initialCity,
    serviceType: "",
    preferredDate: "",
    message: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (initialCity) {
      setForm((prev) => ({ ...prev, city: initialCity }));
    }
  }, [initialCity]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices({ limit: 100 });
        if (response.items) {
          setServices(response.items);
        }
      } catch (error) {
        console.error("Failed to load services", error);
        toast.error("Failed to load services list");
      }
    };
    fetchServices();
  }, []);



  const handleChange = (e) => {
    const { name, value } = e.target;

    // Name validation: prevent numbers
    if (name === "name" && /\d/.test(value)) {
      return; // Block numeric input in Name field
    }

    // Phone validation: only allow numbers, spaces, dashes, and parentheses
    if (name === "phone" && value && !/^[0-9\s\-()]*$/.test(value)) {
      return; // Block non-numeric input in Phone field
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      if (images.length + newImages.length > 5) {
        toast.error("You can upload a maximum of 5 images.");
        return;
      }
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (/\d/.test(form.name)) {
      toast.error("Name should not contain numbers");
      return;
    }

    if (!form.address.trim()) {
      toast.error("Please enter your address");
      return;
    }

    if (!form.city.trim()) {
      toast.error("Please enter your city");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("leadType", "quote");
      formData.append("source", "website");
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("address", form.address);
      formData.append("city", form.city);
      if (form.serviceType) formData.append("serviceType", form.serviceType);
      if (form.preferredDate)
        formData.append("preferredDate", form.preferredDate);
      formData.append("message", form.message);

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await submitLead(formData);

      // Show success toast
      toast.success(response.message || "Thank you! We will contact you soon.");

      // Redirect to thank you page
      router.push("/thank-you");
    } catch (err) {
      console.error(err);
      // Show error toast
      toast.error(
        err.response?.data?.message ||
          "Failed to submit message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Get In Touch & Map */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900 uppercase tracking-wider text-center md:text-left">
                GET A <span className="gradient-text">QUOTE</span>
              </h2>
              <p className="text-base md:text-xl text-gray-600 mb-8 text-center md:text-left">
                Fill out the form below and we will get back to you with a free
                quote.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-600">
                      9380 124 St, Surrey, BC V3V 4S4
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Our Phone</h4>
                    <p className="text-gray-600">604-720-4313</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Our Email</h4>
                    <p className="text-gray-600">
                      mainstreetroofing604@gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="w-full h-[300px] rounded-2xl overflow-hidden shadow-lg border-4 border-gray-50">
              <iframe
                src="https://maps.google.com/maps?q=Mainstreet+Roofing+LTD,+Surrey,+BC&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                title="Mainstreet Roofing Surrey Location"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div
            className="bg-gray-50 rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Request A Quote
              </h3>
              <p className="text-gray-600">
                Tell us about your project and we'll get back to you with an
                estimate.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field py-3"
                  placeholder="Enter your name (letters only)"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field py-3"
                  placeholder="Enter your mail"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="input-field py-3"
                  placeholder="xxx-xxx-xxxx"
                />
              </div>

              {/* Address & City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Address*
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="input-field py-3"
                    placeholder="Street Address"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    City*
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className="input-field py-3"
                    placeholder="City"
                    required
                  />
                </div>
              </div>

              {/* Service Type & Preferred Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="serviceType"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Service Type
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={form.serviceType}
                    onChange={handleChange}
                    className="input-field py-3"
                    required
                  >
                    <option value="">Select Service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.name} className="text-black">
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="preferredDate"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={form.preferredDate}
                    onChange={handleChange}
                    className="input-field py-3"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Project Details
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  className="input-field resize-none py-3"
                  placeholder="Tell us about your project, leak location, roof age, etc..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label
                  htmlFor="images"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Photos (Max 5)
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input-field py-2"
                />
                {images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="w-16 h-16 bg-gray-100 border rounded-md flex items-center justify-center overflow-hidden">
                          <span className="text-xs text-gray-500 break-all px-1 text-center">
                            {img.name.slice(0, 10)}...
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary text-lg py-4 mt-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Submit Quote Request"
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import React, { useState } from "react";
import { useRouter } from "next/router";
import apiClient from "../lib/apiClient";
import LayoutShell from "../components/LayoutShell";
import SeoHead from "../components/SeoHead";
import { getSeoData } from "../lib/api/seo";

export async function getServerSideProps() {
  try {
    const data = await getSeoData("data-deletion");
    return {
      props: {
        seoData: data.success ? data.data : null,
      },
    };
  } catch (error) {
    console.error("Error fetching SEO data:", error);
    return {
      props: {
        seoData: null,
      },
    };
  }
}

export default function DataDeletion({ seoData }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

      const response = await fetch(`${API_BASE_URL}/data-deletion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text:
            data.message ||
            "Your data deletion request has been submitted. We will process it within 30 days.",
        });
        setEmail("");
        setName("");
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to submit request. Please try again.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to submit request. Please try again or contact support directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutShell>
      <SeoHead pageName="data-deletion" initialSeoData={seoData} />
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
              <h1 className="text-3xl font-bold text-white flex items-center">
                <span className="mr-3">🗑️</span>
                Account & Data Deletion
              </h1>
              <p className="text-purple-100 mt-2">Roof Service App</p>
            </div>

            <div className="px-8 py-10">
              {/* In-App Deletion Section */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-1 h-8 bg-purple-600 mr-4 rounded"></div>
                  Delete Your Account In-App
                </h2>
                <p className="text-gray-700 mb-4">
                  You can permanently delete your account and all associated
                  data directly from the mobile app:
                </p>
                <ol className="list-decimal list-inside space-y-3 text-gray-700 ml-4">
                  <li>
                    Open the <strong>Roof Service App</strong> on your mobile
                    device
                  </li>
                  <li>
                    Navigate to your <strong>Profile</strong> screen
                  </li>
                  <li>
                    Scroll down to the <strong>"Danger Zone"</strong> section
                  </li>
                  <li>
                    Tap on <strong>"Delete Account"</strong>
                  </li>
                  <li>Confirm your decision in the confirmation dialogs</li>
                </ol>
              </section>

              {/* Warning Alert */}
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-10">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">⚠️</span>
                  <div>
                    <h3 className="text-red-800 font-semibold mb-2">
                      Warning: This Action is Permanent
                    </h3>
                    <p className="text-red-700 text-sm mb-3">
                      Deleting your account will permanently remove:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-red-700 text-sm ml-4">
                      <li>Your user profile and account information</li>
                      <li>All quotes and service requests</li>
                      <li>Job history and assignments</li>
                      <li>All uploaded images and documents</li>
                      <li>
                        Any other personal data associated with your account
                      </li>
                    </ul>
                    <p className="text-red-800 font-semibold mt-3 text-sm">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              {/* Alternative Email Request */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-1 h-8 bg-purple-600 mr-4 rounded"></div>
                  Alternative: Email Request
                </h2>
                <p className="text-gray-700 mb-6">
                  If you cannot access the app or need assistance with account
                  deletion, submit a request below:
                </p>

                {message.text && (
                  <div
                    className={`mb-6 p-4 rounded-lg ${message.type === "success"
                        ? "bg-green-50 border border-green-200 text-green-800"
                        : "bg-red-50 border border-red-200 text-red-800"
                      }`}
                  >
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
                      placeholder="Your registered name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition"
                      placeholder="Your registered email"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-3"
                          viewBox="0 0 24 24"
                        >
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
                        Submitting...
                      </>
                    ) : (
                      <>📧 Submit Data Deletion Request</>
                    )}
                  </button>
                </form>
              </section>

              {/* Info Box */}
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-10">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">ℹ️</span>
                  <div>
                    <h3 className="text-blue-800 font-semibold mb-2">
                      Processing Time
                    </h3>
                    <p className="text-blue-700 text-sm">
                      In-app deletions are processed immediately. Email requests
                      are typically processed within 30 days of receiving your
                      request. You will receive a confirmation email once your
                      data has been deleted.
                    </p>
                  </div>
                </div>
              </div>

              {/* What Data is Deleted */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-1 h-8 bg-purple-600 mr-4 rounded"></div>
                  What Data is Deleted?
                </h2>
                <p className="text-gray-700 mb-4">
                  When you delete your account, we permanently remove:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Personal information (name, email, phone number)</li>
                  <li>Profile picture and uploaded images</li>
                  <li>Service quotes and requests</li>
                  <li>Job assignments and history</li>
                  <li>Job logs and completion reports</li>
                  <li>Any other data linked to your account</li>
                </ul>
              </section>
            </div>


          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

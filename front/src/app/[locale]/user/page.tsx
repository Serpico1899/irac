"use client";

export const dynamic = "force-dynamic";

export default function UserPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
          User Dashboard
        </h1>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            User dashboard functionality is being prepared.
          </p>
          <p className="text-sm text-gray-500">Please check back soon.</p>
        </div>

        <div className="mt-8">
          <a
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

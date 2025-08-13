export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-md mx-auto text-center px-4">
            {/* 404 Number */}
            <div className="text-6xl md:text-8xl font-bold text-gray-300 mb-4">
              404
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-8 leading-relaxed">
              Sorry, we couldn't find the page you're looking for. Please check
              the URL and try again.
            </p>

            {/* Action Buttons */}
            <div className="space-y-4">
              <a
                href="/fa"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Go to Home
              </a>

              <div className="text-sm text-gray-500">
                or check the URL and try again
              </div>
            </div>

            {/* Decorative Element */}
            <div className="mt-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5a3 3 0 116 0v4H8V5z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">IRAC</h1>
        <p className="text-xl text-gray-600 mb-4">
          Islamic Architecture Center
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <p className="text-lg">
            Current Locale:{" "}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              {locale}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Routing is working correctly ✅
          </p>
        </div>
        <div className="space-x-4">
          <a
            href="/en"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            English
          </a>
          <a
            href="/fa"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            فارسی
          </a>
        </div>
        <div className="mt-8 text-sm text-gray-400">
          Next.js 15 + App Router + Dynamic Routes
        </div>
      </div>
    </div>
  );
}

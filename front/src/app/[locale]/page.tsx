export default async function TestPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page Working!</h1>
        <p className="text-xl mb-2">Locale: {locale}</p>
        <p className="text-gray-600">
          If you can see this, the [locale] routing is working correctly.
        </p>
        <div className="mt-8 space-x-4">
          <a
            href="/en"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            English
          </a>
          <a
            href="/fa"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            فارسی
          </a>
        </div>
      </div>
    </div>
  );
}

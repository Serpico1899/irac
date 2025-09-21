import { MetadataRoute } from 'next';
import { productApi } from '@/services/product/productApi';
import { AppApi } from '@/services/api';

// Define supported locales
const locales = ['fa', 'en'];

// Helper function to get base URL
const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://irac.ir';
};

// Fetch all products for sitemap
async function fetchAllProducts() {
  try {
    const response = await productApi.getProducts({
      page: 1,
      limit: 1000, // Get all products
      status: 'active'
    });
    return response.data?.products || [];
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

// Fetch all articles for sitemap
async function fetchAllArticles() {
  try {
    const api = AppApi();
    // Assuming we have an articles endpoint
    const response = await api.get({
      set: 'article',
      get: {
        title: 1,
        slug: 1,
        updated_at: 1,
        status: 1,
        published_at: 1
      },
      filter: {
        status: 'published'
      }
    });
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error);
    return [];
  }
}

// Fetch all workshops for sitemap
async function fetchAllWorkshops() {
  try {
    const api = AppApi();
    const response = await api.get({
      set: 'workshop',
      get: {
        title: 1,
        slug: 1,
        updated_at: 1,
        status: 1,
        start_date: 1
      },
      filter: {
        status: 'active'
      }
    });
    return response.success ? response.data : [];
  } catch (error) {
    console.error('Error fetching workshops for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const currentDate = new Date();

  // Fetch dynamic content
  const [products, articles, workshops] = await Promise.all([
    fetchAllProducts(),
    fetchAllArticles(),
    fetchAllWorkshops(),
  ]);

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate entries for each locale
  for (const locale of locales) {
    const localePrefix = locale === 'fa' ? '' : `/${locale}`;

    // Static pages for each locale
    const staticPages = [
      {
        url: `${baseUrl}${localePrefix}`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}${localePrefix}/courses`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}${localePrefix}/articles`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}${localePrefix}/workshops`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}${localePrefix}/about`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}${localePrefix}/contact`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}${localePrefix}/gallery`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}${localePrefix}/services`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}${localePrefix}/coworking`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}${localePrefix}/events`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
    ];

    sitemapEntries.push(...staticPages);

    // Product category pages
    const productCategories = [
      'books',
      'digital_books',
      'physical_books',
      'artworks',
      'paintings',
      'sculptures',
      'digital_art',
      'articles',
      'cultural_items',
      'handicrafts',
      'educational',
      'research',
    ];

    const categoryPages = productCategories.map(category => ({
      url: `${baseUrl}${localePrefix}/courses/category/${category}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    sitemapEntries.push(...categoryPages);

    // Dynamic product/course pages
    const productPages = products.map(product => ({
      url: `${baseUrl}${localePrefix}/courses/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: 'weekly' as const,
      priority: product.is_featured ? 0.9 : 0.8,
    }));

    sitemapEntries.push(...productPages);

    // Dynamic article pages
    const articlePages = articles.map(article => ({
      url: `${baseUrl}${localePrefix}/articles/${article.slug}`,
      lastModified: new Date(article.updated_at || article.published_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    sitemapEntries.push(...articlePages);

    // Dynamic workshop pages
    const workshopPages = workshops.map(workshop => ({
      url: `${baseUrl}${localePrefix}/workshops/${workshop.slug}`,
      lastModified: new Date(workshop.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    sitemapEntries.push(...workshopPages);

    // Workshop category and filter pages
    const workshopCategories = ['beginner', 'intermediate', 'advanced'];
    const workshopCategoryPages = workshopCategories.map(level => ({
      url: `${baseUrl}${localePrefix}/workshops/level/${level}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    sitemapEntries.push(...workshopCategoryPages);

    // User-facing pages (non-auth)
    const userPages = [
      {
        url: `${baseUrl}${localePrefix}/search`,
        lastModified: currentDate,
        changeFrequency: 'daily' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}${localePrefix}/privacy-policy`,
        lastModified: currentDate,
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}${localePrefix}/terms-of-service`,
        lastModified: currentDate,
        changeFrequency: 'yearly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}${localePrefix}/faq`,
        lastModified: currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
    ];

    sitemapEntries.push(...userPages);
  }

  // Remove duplicates and sort by priority
  const uniqueEntries = sitemapEntries.filter((entry, index, self) =>
    index === self.findIndex(e => e.url === entry.url)
  );

  return uniqueEntries.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

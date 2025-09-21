import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '8');
    const locale = searchParams.get('locale') || 'fa';

    // Early return if query is too short
    if (query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: []
      });
    }

    // Get the backend URL from environment variables
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

    // For now, we'll provide mock suggestions since the backend suggestions API might not be implemented yet
    // TODO: Replace this with actual backend API call when available

    try {
      // Attempt to call backend suggestions API (if available)
      const backendResponse = await fetch(`${backendUrl}/api/search/suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          limit,
          language: locale,
          include_metadata: true
        }),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();

        if (backendData.success && backendData.data?.suggestions) {
          // Transform backend suggestions to frontend format
          const transformedSuggestions = backendData.data.suggestions.map((item: any) => ({
            id: item.id || item._id,
            text: item.text || item.title || item.name,
            type: item.type?.toLowerCase() || 'course',
            category: item.category,
            url: item.url || generateContentUrl(item),
            description: item.description,
            meta: {
              price: item.price,
              rating: item.rating || item.average_rating,
              level: item.level
            }
          }));

          return NextResponse.json({
            success: true,
            suggestions: transformedSuggestions
          });
        }
      }
    } catch (backendError) {
      console.log('Backend suggestions API not available, using fallback:', backendError.message);
    }

    // Fallback: Generate mock suggestions based on query
    const mockSuggestions = generateMockSuggestions(query, limit, locale);

    return NextResponse.json({
      success: true,
      suggestions: mockSuggestions
    });

  } catch (error) {
    console.error('Search suggestions API error:', error);

    return NextResponse.json(
      {
        success: false,
        message: "خطا در دریافت پیشنهادات",
        message_en: "Error fetching suggestions",
        suggestions: []
      },
      { status: 500 }
    );
  }
}

// Helper function to generate content URLs
function generateContentUrl(item: any) {
  const baseType = item.content_type?.toLowerCase() || item.type?.toLowerCase() || 'course';
  const slug = item.slug || item._id;

  switch (baseType) {
    case 'workshop':
      return `/workshops/${slug}`;
    case 'article':
      return `/articles/${slug}`;
    case 'product':
      return `/products/${slug}`;
    case 'course':
    default:
      return `/courses/${slug}`;
  }
}

// Mock suggestions generator for development/fallback
function generateMockSuggestions(query: string, limit: number, locale: string) {
  const queryLower = query.toLowerCase().trim();

  // Common search terms and their suggestions
  const suggestionTemplates = [
    // Architecture related
    {
      keywords: ['معماری', 'architecture', 'ساختمان', 'building'],
      suggestions: [
        {
          id: 'arch_1',
          text: locale === 'fa' ? 'دوره مقدمات معماری' : 'Architecture Fundamentals Course',
          type: 'course',
          category: locale === 'fa' ? 'معماری' : 'Architecture',
          url: '/courses/architecture-fundamentals',
          description: locale === 'fa' ? 'آموزش پایه‌های معماری' : 'Basic architecture training',
          meta: { price: 1500000, rating: 4.5, level: 'Beginner' }
        },
        {
          id: 'arch_2',
          text: locale === 'fa' ? 'اصول طراحی معماری' : 'Architectural Design Principles',
          type: 'article',
          category: locale === 'fa' ? 'مقالات' : 'Articles',
          url: '/articles/architectural-design-principles',
          description: locale === 'fa' ? 'مقاله درباره اصول طراحی' : 'Article about design principles'
        }
      ]
    },
    // Calligraphy related
    {
      keywords: ['خوشنویسی', 'calligraphy', 'خط', 'writing'],
      suggestions: [
        {
          id: 'cal_1',
          text: locale === 'fa' ? 'کارگاه خوشنویسی نستعلیق' : 'Nastaliq Calligraphy Workshop',
          type: 'workshop',
          category: locale === 'fa' ? 'خوشنویسی' : 'Calligraphy',
          url: '/workshops/nastaliq-calligraphy',
          meta: { price: 800000, rating: 4.8, level: 'Intermediate' }
        }
      ]
    },
    // Art related
    {
      keywords: ['هنر', 'art', 'نقاشی', 'painting', 'طراحی', 'design'],
      suggestions: [
        {
          id: 'art_1',
          text: locale === 'fa' ? 'دوره نقاشی سنتی' : 'Traditional Painting Course',
          type: 'course',
          category: locale === 'fa' ? 'هنر' : 'Art',
          url: '/courses/traditional-painting',
          meta: { price: 1200000, rating: 4.6, level: 'Beginner' }
        }
      ]
    },
    // History related
    {
      keywords: ['تاریخ', 'history', 'باستان', 'ancient'],
      suggestions: [
        {
          id: 'hist_1',
          text: locale === 'fa' ? 'تاریخ معماری ایران' : 'History of Iranian Architecture',
          type: 'article',
          category: locale === 'fa' ? 'تاریخ' : 'History',
          url: '/articles/iranian-architecture-history'
        }
      ]
    }
  ];

  // Find matching suggestions
  const matchingSuggestions = [];

  for (const template of suggestionTemplates) {
    const hasMatch = template.keywords.some(keyword =>
      queryLower.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(queryLower)
    );

    if (hasMatch) {
      matchingSuggestions.push(...template.suggestions);
    }
  }

  // If no specific matches, provide general suggestions
  if (matchingSuggestions.length === 0) {
    const generalSuggestions = [
      {
        id: 'gen_1',
        text: locale === 'fa' ? `جستجو برای "${query}" در دوره‌ها` : `Search for "${query}" in courses`,
        type: 'course',
        url: `/search?q=${encodeURIComponent(query)}&filter_content_types=["Course"]`
      },
      {
        id: 'gen_2',
        text: locale === 'fa' ? `جستجو برای "${query}" در مقالات` : `Search for "${query}" in articles`,
        type: 'article',
        url: `/search?q=${encodeURIComponent(query)}&filter_content_types=["Article"]`
      },
      {
        id: 'gen_3',
        text: locale === 'fa' ? `جستجو برای "${query}" در کارگاه‌ها` : `Search for "${query}" in workshops`,
        type: 'workshop',
        url: `/search?q=${encodeURIComponent(query)}&filter_content_types=["Workshop"]`
      }
    ];

    matchingSuggestions.push(...generalSuggestions);
  }

  // Add query-based suggestions
  if (query.length >= 3) {
    matchingSuggestions.unshift({
      id: 'query_match',
      text: query,
      type: 'recent',
      url: `/search?q=${encodeURIComponent(query)}`
    });
  }

  // Return limited results
  return matchingSuggestions.slice(0, limit);
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

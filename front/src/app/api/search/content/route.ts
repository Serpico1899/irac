import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract search parameters
    const {
      query = "",
      content_types = ["Course", "Article", "Workshop", "Product"],
      category_id,
      tags = [],
      level,
      language = "both",
      min_price,
      max_price,
      is_free,
      date_from,
      date_to,
      duration_min,
      duration_max,
      min_rating,
      instructor_id,
      author_id,
      featured_only,
      sort_by = "relevance",
      page = 1,
      limit = 12,
      include_facets = true,
    } = body;

    // Get the backend URL from environment variables
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

    // Prepare the request payload for the backend
    const searchPayload = {
      query: query.trim(),
      content_types,
      category_id,
      tags,
      level,
      language,
      min_price,
      max_price,
      is_free,
      date_from,
      date_to,
      duration_min,
      duration_max,
      min_rating,
      instructor_id,
      author_id,
      featured_only,
      sort_by,
      page: parseInt(page.toString()),
      limit: parseInt(limit.toString()),
      include_facets,
    };

    // Call the backend search API
    const backendResponse = await fetch(`${backendUrl}/api/search/searchContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(searchPayload),
    });

    if (!backendResponse.ok) {
      console.error('Backend search API error:', backendResponse.status, backendResponse.statusText);

      // Try to get error details
      let errorMessage = 'Search service unavailable';
      try {
        const errorData = await backendResponse.json();
        errorMessage = errorData.message || errorData.message_en || errorMessage;
      } catch (e) {
        // Ignore JSON parse errors
      }

      return NextResponse.json(
        {
          success: false,
          message: "خطا در جستجو",
          message_en: errorMessage,
          error: `Backend API returned ${backendResponse.status}`
        },
        { status: 500 }
      );
    }

    const searchResults = await backendResponse.json();

    // Validate the response structure
    if (!searchResults.success) {
      return NextResponse.json(
        {
          success: false,
          message: searchResults.message || "خطا در جستجو",
          message_en: searchResults.message_en || "Search failed",
        },
        { status: 400 }
      );
    }

    // Transform the response if needed to match frontend expectations
    const transformedResults = {
      success: true,
      data: {
        results: searchResults.data?.results || [],
        pagination: {
          current_page: searchResults.data?.pagination?.current_page || 1,
          total_pages: searchResults.data?.pagination?.total_pages || 1,
          total_items: searchResults.data?.pagination?.total_items || 0,
          items_per_page: searchResults.data?.pagination?.items_per_page || 12,
          has_next: searchResults.data?.pagination?.has_next || false,
          has_previous: searchResults.data?.pagination?.has_previous || false,
        },
        facets: searchResults.data?.facets || {},
        query_info: {
          query: query.trim(),
          total_results: searchResults.data?.pagination?.total_items || 0,
          search_time: Date.now(), // Since we don't get this from backend
          filters_applied: searchResults.data?.query_info?.filters_applied || {},
        },
      },
    };

    return NextResponse.json(transformedResults);

  } catch (error) {
    console.error('Search API error:', error);

    return NextResponse.json(
      {
        success: false,
        message: "خطای داخلی سرور",
        message_en: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

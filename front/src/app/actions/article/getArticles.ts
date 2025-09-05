"use server";

import { AppApi } from "@/services/api";
import { cookies } from "next/headers";

export interface GetArticlesParams {
  search?: string;
  category_id?: string;
  author_id?: string;
  type?: string;
  featured?: boolean;
  published_after?: string;
  published_before?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  status?: string;
  populate?: string[];
}

export const getArticles = async (params: GetArticlesParams = {}) => {
  const token = (await cookies()).get("token");

  const {
    search = "",
    category_id = "",
    author_id = "",
    type = "",
    featured,
    published_after = "",
    published_before = "",
    page = 1,
    limit = 12,
    sort_by = "published_at",
    status = "Published",
    populate = ["category", "tags", "featured_image", "author"],
  } = params;

  try {
    return await AppApi().send(
      {
        service: "main",
        model: "article" as any,
        act: "getArticles",
        details: {
          set: {
            search,
            category_id,
            author_id,
            type,
            featured,
            published_after,
            published_before,
            page,
            limit,
            sort_by,
            status,
            populate,
          },
          get: {
            _id: 1,
            title: 1,
            title_en: 1,
            content: 1,
            content_en: 1,
            excerpt: 1,
            excerpt_en: 1,
            slug: 1,
            status: 1,
            type: 1,
            featured: 1,
            pinned: 1,
            published_at: 1,
            view_count: 1,
            like_count: 1,
            comment_count: 1,
            estimated_reading_time: 1,
            featured_image: {
              _id: 1,
              name: 1,
              url: 1,
              alt: 1,
            },
            category: {
              _id: 1,
              name: 1,
              name_en: 1,
              slug: 1,
            },
            tags: {
              _id: 1,
              name: 1,
              name_en: 1,
              slug: 1,
            },
            author: {
              _id: 1,
              first_name: 1,
              last_name: 1,
              avatar: {
                _id: 1,
                url: 1,
              },
            },
          },
        },
      },
      token?.value ? { token: token.value } : {},
    );
  } catch (error) {
    // Return mock response during build time when backend is unavailable
    console.warn(
      "Backend unavailable during build, returning mock data:",
      error,
    );
    return {
      success: true,
      data: {
        articles: [],
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_items: 0,
          items_per_page: limit,
          has_next: false,
          has_previous: false,
        },
        filters: {
          available_categories: [],
          available_authors: [],
          available_types: [],
        },
      },
    };
  }
};

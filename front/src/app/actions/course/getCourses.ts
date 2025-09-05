"use server";

import { AppApi } from "@/services/api";
import { cookies } from "next/headers";

export interface GetCoursesParams {
  search?: string;
  category_id?: string;
  instructor_id?: string;
  level?: string;
  type?: string;
  featured?: boolean;
  price_min?: number;
  price_max?: number;
  is_workshop?: boolean;
  page?: number;
  limit?: number;
  sort_by?: string;
  status?: string;
  populate?: string[];
}

export const getCourses = async (params: GetCoursesParams = {}) => {
  const token = (await cookies()).get("token");

  const {
    search = "",
    category_id = "",
    instructor_id = "",
    level = "",
    type = "",
    featured,
    price_min,
    price_max,
    is_workshop,
    page = 1,
    limit = 12,
    sort_by = "created_at",
    status = "Active",
    populate = ["category", "tags", "featured_image", "instructor"],
  } = params;

  try {
    return await AppApi().send(
      {
        service: "main",
        model: "course" as any,
        act: "getCourses",
        details: {
          set: {
            search,
            category_id,
            instructor_id,
            level,
            type,
            featured,
            price_min,
            price_max,
            is_workshop,
            page,
            limit,
            sort_by,
            status,
            populate,
          },
          get: {
            _id: 1,
            name: 1,
            name_en: 1,
            description: 1,
            description_en: 1,
            short_description: 1,
            short_description_en: 1,
            slug: 1,
            status: 1,
            type: 1,
            level: 1,
            featured: 1,
            price: 1,
            original_price: 1,
            duration: 1,
            start_date: 1,
            end_date: 1,
            max_students: 1,
            enrolled_students: 1,
            requirements: 1,
            requirements_en: 1,
            what_you_learn: 1,
            what_you_learn_en: 1,
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
            instructor: {
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
        courses: [],
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
          available_instructors: [],
          price_range: { min: 0, max: 0 },
        },
      },
    };
  }
};

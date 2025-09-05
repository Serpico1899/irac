"use server";

import { AppApi } from "@/services/api";
import { cookies } from "next/headers";

export interface GetCourseParams {
  slug?: string;
  _id?: string;
  populate?: string[];
}

export const getCourse = async (params: GetCourseParams) => {
  const token = (await cookies()).get("token");

  const {
    slug,
    _id,
    populate = [
      "category",
      "tags",
      "featured_image",
      "gallery",
      "instructor",
      "related_courses",
    ],
  } = params;

  try {
    return await AppApi().send(
      {
        service: "main",
        model: "course" as any,
        act: "getCourse",
        details: {
          set: {
            slug,
            _id,
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
            curriculum: 1,
            curriculum_en: 1,
            meta_title: 1,
            meta_title_en: 1,
            meta_description: 1,
            meta_description_en: 1,
            createdAt: 1,
            updatedAt: 1,
            featured_image: {
              _id: 1,
              name: 1,
              url: 1,
              alt: 1,
            },
            gallery: {
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
              description: 1,
              description_en: 1,
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
              summary: 1,
              avatar: {
                _id: 1,
                url: 1,
              },
            },
            related_courses: {
              _id: 1,
              name: 1,
              name_en: 1,
              slug: 1,
              short_description: 1,
              short_description_en: 1,
              price: 1,
              original_price: 1,
              level: 1,
              duration: 1,
              featured_image: {
                _id: 1,
                name: 1,
                url: 1,
                alt: 1,
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
      success: false,
      data: null,
      message: "Course not found",
    };
  }
};

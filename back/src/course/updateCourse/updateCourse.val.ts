import {
  array,
  boolean,
  coerce,
  date,
  number,
  object,
  objectIdValidation,
  optional,
  string,
} from "@deps";
import { selectStruct } from "../../../mod.ts";
import {
  course_level_enums,
  course_status_enums,
  course_type_enums,
} from "@model";

export const updateCourseValidator = () => {
  return object({
    filter: object({
      _id: objectIdValidation,
    }),
    set: object({
      // Basic fields - all optional for updates
      name: optional(string([
        { min: 3, message: "نام دوره باید حداقل 3 کاراکتر باشد" },
        { max: 200, message: "نام دوره نمی‌تواند بیش از 200 کاراکتر باشد" }
      ])),
      description: optional(string([
        { min: 20, message: "توضیحات دوره باید حداقل 20 کاراکتر باشد" },
        { max: 5000, message: "توضیحات دوره نمی‌تواند بیش از 5000 کاراکتر باشد" }
      ])),
      short_description: optional(string([
        { max: 500, message: "توضیحات کوتاه نمی‌تواند بیش از 500 کاراکتر باشد" }
      ])),

      // Course properties
      level: optional(course_level_enums),
      type: optional(course_type_enums),
      status: optional(course_status_enums),

      // Multilingual support
      name_en: optional(string([
        { min: 3, message: "English name must be at least 3 characters" },
        { max: 200, message: "English name cannot exceed 200 characters" }
      ])),
      description_en: optional(string([
        { min: 20, message: "English description must be at least 20 characters" },
        { max: 5000, message: "English description cannot exceed 5000 characters" }
      ])),
      short_description_en: optional(string([
        { max: 500, message: "English short description cannot exceed 500 characters" }
      ])),

      // Pricing
      price: optional(number([
        { min: 0, message: "قیمت نمی‌تواند منفی باشد" },
        { max: 999999999, message: "قیمت بیش از حد مجاز است" }
      ])),
      original_price: optional(number([
        { min: 0, message: "قیمت اصلی نمی‌تواند منفی باشد" }
      ])),
      is_free: optional(boolean()),

      // Course metadata
      duration_weeks: optional(number([
        { min: 1, message: "مدت دوره باید حداقل 1 هفته باشد" },
        { max: 104, message: "مدت دوره نمی‌تواند بیش از 104 هفته باشد" }
      ])),
      duration_hours: optional(number([
        { min: 1, message: "مدت دوره باید حداقل 1 ساعت باشد" },
        { max: 1000, message: "مدت دوره نمی‌تواند بیش از 1000 ساعت باشد" }
      ])),
      max_students: optional(number([
        { min: 1, message: "حداکثر دانشجو باید حداقل 1 نفر باشد" },
        { max: 1000, message: "حداکثر دانشجو نمی‌تواند بیش از 1000 نفر باشد" }
      ])),
      min_students: optional(number([
        { min: 1, message: "حداقل دانشجو باید 1 نفر باشد" },
        { max: 100, message: "حداقل دانشجو نمی‌تواند بیش از 100 نفر باشد" }
      ])),

      // Scheduling
      start_date: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),
      end_date: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),
      registration_deadline: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),

      // Course content
      curriculum: optional(string([
        { max: 10000, message: "برنامه درسی نمی‌تواند بیش از 10000 کاراکتر باشد" }
      ])),
      prerequisites: optional(string([
        { max: 2000, message: "پیش‌نیازها نمی‌تواند بیش از 2000 کاراکتر باشد" }
      ])),
      learning_outcomes: optional(string([
        { max: 3000, message: "اهداف یادگیری نمی‌تواند بیش از 3000 کاراکتر باشد" }
      ])),

      // Instructor information
      instructor_name: optional(string([
        { min: 2, message: "نام مدرس باید حداقل 2 کاراکتر باشد" },
        { max: 100, message: "نام مدرس نمی‌تواند بیش از 100 کاراکتر باشد" }
      ])),
      instructor_bio: optional(string([
        { max: 2000, message: "بیوگرافی مدرس نمی‌تواند بیش از 2000 کاراکتر باشد" }
      ])),
      instructor_bio_en: optional(string([
        { max: 2000, message: "English instructor bio cannot exceed 2000 characters" }
      ])),

      // Ratings and reviews (usually managed by system, but allow admin override)
      average_rating: optional(number([
        { min: 0, message: "امتیاز میانگین نمی‌تواند منفی باشد" },
        { max: 5, message: "امتیاز میانگین نمی‌تواند بیش از 5 باشد" }
      ])),
      total_reviews: optional(number([
        { min: 0, message: "تعداد نظرات نمی‌تواند منفی باشد" }
      ])),
      total_students: optional(number([
        { min: 0, message: "تعداد دانشجویان نمی‌تواند منفی باشد" }
      ])),

      // SEO fields
      slug: optional(string([
        { min: 3, message: "نام مستعار باید حداقل 3 کاراکتر باشد" },
        { max: 200, message: "نام مستعار نمی‌تواند بیش از 200 کاراکتر باشد" }
      ])),
      meta_title: optional(string([
        { max: 70, message: "عنوان متا نمی‌تواند بیش از 70 کاراکتر باشد" }
      ])),
      meta_description: optional(string([
        { max: 160, message: "توضیحات متا نمی‌تواند بیش از 160 کاراکتر باشد" }
      ])),

      // Workshop specific
      is_workshop: optional(boolean()),
      workshop_location: optional(string([
        { max: 300, message: "آدرس ورکشاپ نمی‌تواند بیش از 300 کاراکتر باشد" }
      ])),
      is_online: optional(boolean()),
      meeting_link: optional(string([
        { max: 500, message: "لینک جلسه نمی‌تواند بیش از 500 کاراکتر باشد" }
      ])),

      // Content management
      featured: optional(boolean()),
      sort_order: optional(number([
        { min: 0, message: "ترتیب نمایش باید عدد مثبت باشد" }
      ])),

      // Points system
      completion_points: optional(number([
        { min: 0, message: "امتیاز تکمیل باید عدد مثبت باشد" },
        { max: 10000, message: "امتیاز تکمیل نمی‌تواند بیش از 10000 باشد" }
      ])),

      // File relations
      featured_image: optional(objectIdValidation),
      gallery: optional(array(objectIdValidation)),

      // Content relations
      category: optional(objectIdValidation),
      tags: optional(array(objectIdValidation)),
      instructor: optional(objectIdValidation),
      creator: optional(objectIdValidation),

      // Course relations
      related_courses: optional(array(objectIdValidation)),
      prerequisite_courses: optional(array(objectIdValidation)),

      // Note: enrolled_users should not be updated via this API
      // It's handled by enrollment APIs
    }),
    get: selectStruct("course", 2),
  });
};

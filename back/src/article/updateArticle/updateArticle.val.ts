import {
  array,
  boolean,
  coerce,
  date,
  enums,
  number,
  object,
  objectIdValidation,
  optional,
  string,
} from "@deps";
import {  selectStruct  } from "@app";
import { article_status_enums, article_type_enums } from "@model";

export const updateArticleValidator = () => {
  return object({
    set: object({
      // Required field for identification
      _id: objectIdValidation,

      // Optional basic fields
      title: optional(string([
        { min: 3, message: "عنوان باید حداقل 3 کاراکتر باشد" },
        { max: 200, message: "عنوان نمی‌تواند بیش از 200 کاراکتر باشد" }
      ])),
      content: optional(string([
        { min: 50, message: "محتوا باید حداقل 50 کاراکتر باشد" },
        { max: 100000, message: "محتوا نمی‌تواند بیش از 100,000 کاراکتر باشد" }
      ])),
      excerpt: optional(string([
        { max: 500, message: "خلاصه نمی‌تواند بیش از 500 کاراکتر باشد" }
      ])),

      // Multilingual support
      title_en: optional(string([
        { min: 3, message: "English title must be at least 3 characters" },
        { max: 200, message: "English title cannot exceed 200 characters" }
      ])),
      content_en: optional(string([
        { min: 50, message: "English content must be at least 50 characters" },
        { max: 100000, message: "English content cannot exceed 100,000 characters" }
      ])),
      excerpt_en: optional(string([
        { max: 500, message: "English excerpt cannot exceed 500 characters" }
      ])),

      // Article management
      status: optional(article_status_enums),
      type: optional(article_type_enums),

      // Publishing dates
      published_at: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),
      scheduled_at: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),
      archive_date: optional(
        coerce(date(), string(), (value) => new Date(value))
      ),

      // Content flags
      featured: optional(boolean()),
      pinned: optional(boolean()),
      sort_order: optional(number([
        { min: 0, message: "ترتیب باید عدد مثبت باشد" }
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
      meta_title_en: optional(string([
        { max: 70, message: "Meta title cannot exceed 70 characters" }
      ])),
      meta_description_en: optional(string([
        { max: 160, message: "Meta description cannot exceed 160 characters" }
      ])),

      // Reading and engagement
      estimated_reading_time: optional(number([
        { min: 1, message: "زمان مطالعه باید حداقل 1 دقیقه باشد" },
        { max: 300, message: "زمان مطالعه نمی‌تواند بیش از 300 دقیقه باشد" }
      ])),

      // Content settings
      allow_comments: optional(boolean()),
      featured_on_homepage: optional(boolean()),
      is_premium: optional(boolean()),
      requires_login: optional(boolean()),

      // Social media
      social_image_alt: optional(string([
        { max: 125, message: "متن جایگزین تصویر اجتماعی نمی‌تواند بیش از 125 کاراکتر باشد" }
      ])),
      social_image_alt_en: optional(string([
        { max: 125, message: "Social image alt text cannot exceed 125 characters" }
      ])),

      // Academic/Research fields
      abstract: optional(string([
        { max: 1000, message: "چکیده نمی‌تواند بیش از 1000 کاراکتر باشد" }
      ])),
      abstract_en: optional(string([
        { max: 1000, message: "English abstract cannot exceed 1000 characters" }
      ])),
      keywords: optional(string([
        { max: 500, message: "کلیدواژه‌ها نمی‌تواند بیش از 500 کاراکتر باشد" }
      ])),
      keywords_en: optional(string([
        { max: 500, message: "English keywords cannot exceed 500 characters" }
      ])),
      doi: optional(string([
        { max: 100, message: "DOI نمی‌تواند بیش از 100 کاراکتر باشد" }
      ])),
      citation: optional(string([
        { max: 500, message: "استناد نمی‌تواند بیش از 500 کاراکتر باشد" }
      ])),

      // Media URLs
      video_url: optional(string([
        { max: 500, message: "آدرس ویدیو نمی‌تواند بیش از 500 کاراکتر باشد" }
      ])),
      audio_url: optional(string([
        { max: 500, message: "آدرس صوت نمی‌تواند بیش از 500 کاراکتر باشد" }
      ])),

      // Update control flags
      update_slug: optional(boolean()),

      // File relations (can be set to null to remove)
      featured_image: optional(objectIdValidation),
      social_image: optional(objectIdValidation),
      gallery: optional(array(objectIdValidation)),
      referenced_files: optional(array(objectIdValidation)),

      // Content relations (can be set to null/empty to remove)
      category: optional(objectIdValidation),
      tags: optional(array(objectIdValidation)),
      author: optional(objectIdValidation),
      editors: optional(array(objectIdValidation)),

      // Related content
      related_articles: optional(array(objectIdValidation)),
      related_courses: optional(array(objectIdValidation)),
    }),
    get: selectStruct("article", 2),
  });
};

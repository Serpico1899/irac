import {
  array,
  boolean,
  coerce,
  date,
  enums,
  number,
  object,
  optional,
  string,
} from "@deps";

const statusEnum = enums(["Draft", "Published", "Archived", "Scheduled"]);
const typeEnum = enums(["Article", "News", "Research", "Tutorial", "Interview"]);
const sortByEnum = enums(["published_at", "created_at", "updated_at", "view_count", "like_count", "title"]);
const sortOrderEnum = enums(["asc", "desc"]);

export const getArticlesValidator = {
  details: optional(
    object({
      // Pagination
      page: optional(number([{ min: 1, message: "صفحه باید بزرگتر از 0 باشد" }])),
      limit: optional(
        number([
          { min: 1, message: "تعداد آیتم‌ها باید بزرگتر از 0 باشد" },
          { max: 100, message: "حداکثر 100 آیتم در هر صفحه مجاز است" }
        ])
      ),

      // Filtering
      status: optional(statusEnum),
      type: optional(typeEnum),
      category_id: optional(string([{ min: 24, max: 24, message: "شناسه دسته‌بندی نامعتبر است" }])),
      tag_ids: optional(array(string([{ min: 24, max: 24, message: "شناسه تگ نامعتبر است" }]))),
      author_id: optional(string([{ min: 24, max: 24, message: "شناسه نویسنده نامعتبر است" }])),

      // Search
      search: optional(string([
        { min: 2, message: "حداقل 2 کاراکتر برای جستجو لازم است" },
        { max: 100, message: "حداکثر 100 کاراکتر برای جستجو مجاز است" }
      ])),

      // Special filters
      featured: optional(boolean()),
      pinned: optional(boolean()),
      featured_on_homepage: optional(boolean()),
      allow_comments: optional(boolean()),

      // Date filtering
      published_after: optional(coerce(date(), string(), (value) => new Date(value))),
      published_before: optional(coerce(date(), string(), (value) => new Date(value))),

      // Sorting
      sort_by: optional(sortByEnum),
      sort_order: optional(sortOrderEnum),

      // Relations to populate
      populate: optional(array(string([
        { min: 1, max: 50, message: "نام رابطه نامعتبر است / Invalid relation name" }
      ]))),
    })
  ),
};

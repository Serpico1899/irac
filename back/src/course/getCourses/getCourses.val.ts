import {
  array,
  boolean,
  enums,
  number,
  object,
  optional,
  string,
} from "@deps";

const statusEnum = enums(["Draft", "Active", "Archived", "Sold_Out"]);
const levelEnum = enums(["Beginner", "Intermediate", "Advanced"]);
const typeEnum = enums(["Course", "Workshop", "Bootcamp", "Seminar"]);
const sortByEnum = enums(["created_at", "updated_at", "price", "name", "start_date", "average_rating"]);
const sortOrderEnum = enums(["asc", "desc"]);

export const getCoursesValidator = {
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
      level: optional(levelEnum),
      type: optional(typeEnum),
      category_id: optional(string([{ min: 24, max: 24, message: "شناسه دسته‌بندی نامعتبر است" }])),
      tag_ids: optional(array(string([{ min: 24, max: 24, message: "شناسه تگ نامعتبر است" }]))),

      // Price filtering
      min_price: optional(number([{ min: 0, message: "حداقل قیمت نمی‌تواند منفی باشد" }])),
      max_price: optional(number([{ min: 0, message: "حداکثر قیمت نمی‌تواند منفی باشد" }])),
      is_free: optional(boolean()),

      // Search
      search: optional(string([
        { min: 2, message: "حداقل 2 کاراکتر برای جستجو لازم است" },
        { max: 100, message: "حداکثر 100 کاراکتر برای جستجو مجاز است" }
      ])),

      // Special filters
      featured: optional(boolean()),
      is_workshop: optional(boolean()),
      is_online: optional(boolean()),

      // Sorting
      sort_by: optional(sortByEnum),
      sort_order: optional(sortOrderEnum),

      // Relations to populate
      populate: optional(array(string())),
    })
  ),
};

import { object, optional } from "@deps";

export const getHomePageDataValidator = () => {
  return object({
    set: optional(object({})),
    get: optional(object({
      courses: optional(object({
        title: optional(object({ en: optional(object({})), fa: optional(object({})) })),
        description: optional(object({ en: optional(object({})), fa: optional(object({})) })),
        instructorName: optional(object({})),
        price: optional(object({})),
        duration: optional(object({})),
        imageUrl: optional(object({})),
        createdAt: optional(object({})),
        isFeatured: optional(object({})),
      })),
      articles: optional(object({
        title: optional(object({ en: optional(object({})), fa: optional(object({})) })),
        description: optional(object({ en: optional(object({})), fa: optional(object({})) })),
        author: optional(object({})),
        imageUrl: optional(object({})),
        createdAt: optional(object({})),
        slug: optional(object({})),
      })),
      products: optional(object({
        title: optional(object({ en: optional(object({})), fa: optional(object({})) })),
        description: optional(object({ en: optional(object({})), fa: optional(object({})) })),
        price: optional(object({})),
        imageUrl: optional(object({})),
        createdAt: optional(object({})),
        category: optional(object({})),
      })),
    })),
  });
};

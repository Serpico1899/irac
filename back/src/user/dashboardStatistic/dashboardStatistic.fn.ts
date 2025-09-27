import type { ActFn } from "@deps";
import { 
  article,
  category,
  course,
  file,
  tag,
  user,
 } from "@app";

export const dashboardStatisticFn: ActFn = async () => {
  const articles = await article.countDocument({});
  const categories = await category.countDocument({});
  const courses = await course.countDocument({});
  const files = await file.countDocument({});
  const tags = await tag.countDocument({});
  const users = await user.countDocument({});

  return {
    articles,
    categories,
    courses,
    files,
    tags,
    users,
  };
};

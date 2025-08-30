import type { ActFn } from "@deps";
import { course } from "../../../mod.ts";

export const getCoursesFn: ActFn = async (body) => {
  const {
    set: { page = 1, limit = 10 },
    get,
  } = body.details;

  const pipeline: any[] = [];

  // Sort by creation date (newest first)
  pipeline.push({ $sort: { createdAt: -1 } });

  // Add pagination
  pipeline.push({ $skip: (page - 1) * limit });
  pipeline.push({ $limit: limit });

  return await course
    .aggregation({
      pipeline,
      projection: get,
    })
    .toArray();
};

import { type ActFn, ObjectId, type TUpdateRelations } from "@deps";
import { courses } from "@model";
import type { course_relations } from "@model";

const updateCourseFn: ActFn = async (body) => {
  const { set, get, filter } = body.details;

  const {
    featured_image,
    gallery,
    category,
    tags,
    instructor,
    creator,
    related_courses,
    prerequisite_courses,
    enrolled_users,
    ...rest
  } = set;

  const relations: TUpdateRelations<typeof course_relations> = {};

  // Single relations - only update if provided
  if (featured_image !== undefined) {
    relations.featured_image = featured_image ? {
      _ids: new ObjectId(featured_image as string),
    } : { deleteAll: true };
  }

  if (category !== undefined) {
    relations.category = category ? {
      _ids: new ObjectId(category as string),
    } : { deleteAll: true };
  }

  if (instructor !== undefined) {
    relations.instructor = instructor ? {
      _ids: new ObjectId(instructor as string),
    } : { deleteAll: true };
  }

  if (creator !== undefined) {
    relations.creator = creator ? {
      _ids: new ObjectId(creator as string),
    } : { deleteAll: true };
  }

  // Multiple relations - replace existing if provided
  if (gallery !== undefined) {
    if (Array.isArray(gallery) && gallery.length > 0) {
      relations.gallery = {
        _ids: gallery.map((id: string) => new ObjectId(id)),
      };
    } else {
      relations.gallery = { deleteAll: true };
    }
  }

  if (tags !== undefined) {
    if (Array.isArray(tags) && tags.length > 0) {
      relations.tags = {
        _ids: tags.map((id: string) => new ObjectId(id)),
      };
    } else {
      relations.tags = { deleteAll: true };
    }
  }

  if (related_courses !== undefined) {
    if (Array.isArray(related_courses) && related_courses.length > 0) {
      relations.related_courses = {
        _ids: related_courses.map((id: string) => new ObjectId(id)),
      };
    } else {
      relations.related_courses = { deleteAll: true };
    }
  }

  if (prerequisite_courses !== undefined) {
    if (Array.isArray(prerequisite_courses) && prerequisite_courses.length > 0) {
      relations.prerequisite_courses = {
        _ids: prerequisite_courses.map((id: string) => new ObjectId(id)),
      };
    } else {
      relations.prerequisite_courses = { deleteAll: true };
    }
  }

  // Handle enrolled_users separately (shouldn't be updated via this API)
  if (enrolled_users !== undefined) {
    delete rest.enrolled_users;
  }

  // Convert date strings to Date objects if they exist
  if (rest.start_date && typeof rest.start_date === 'string') {
    rest.start_date = new Date(rest.start_date);
  }

  if (rest.end_date && typeof rest.end_date === 'string') {
    rest.end_date = new Date(rest.end_date);
  }

  if (rest.registration_deadline && typeof rest.registration_deadline === 'string') {
    rest.registration_deadline = new Date(rest.registration_deadline);
  }

  // Update pricing logic
  if (rest.is_free !== undefined && rest.price !== undefined) {
    if (rest.is_free && rest.price > 0) {
      rest.is_free = false;
    }
  }

  // Update workshop flag based on type
  if (rest.type === "Workshop") {
    rest.is_workshop = true;
  } else if (rest.type && rest.type !== "Workshop") {
    rest.is_workshop = false;
  }

  // Generate meta fields if not provided and content is being updated
  if (!rest.meta_title && rest.name) {
    rest.meta_title = rest.name.substring(0, 70);
  }

  if (!rest.meta_description && rest.description) {
    rest.meta_description = rest.description.substring(0, 160);
  }

  // Update the course
  const updatedCourse = await courses().updateOne({
    filter,
    doc: rest,
    relations,
    projection: get,
  });

  return updatedCourse;
};

export default updateCourseFn;

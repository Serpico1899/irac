import { type ActFn, ObjectId } from "@deps";
import { courses } from "@model";

const createCourseFn: ActFn = async (body) => {
  try {
    const courseData = body.details || {};

    // Validate required fields
    if (!courseData.name) {
      return {
        success: false,
        message: "نام دوره الزامی است / Course name is required"
      };
    }

    if (!courseData.description) {
      return {
        success: false,
        message: "توضیحات دوره الزامی است / Course description is required"
      };
    }

    if (!courseData.level) {
      return {
        success: false,
        message: "سطح دوره الزامی است / Course level is required"
      };
    }

    if (!courseData.type) {
      return {
        success: false,
        message: "نوع دوره الزامی است / Course type is required"
      };
    }

    if (courseData.price === undefined || courseData.price === null) {
      return {
        success: false,
        message: "قیمت دوره الزامی است / Course price is required"
      };
    }

    // Set default values
    const courseDoc = {
      ...courseData,
      status: courseData.status || "Draft",
      is_free: courseData.price === 0 || courseData.is_free || false,
      is_online: courseData.is_online !== undefined ? courseData.is_online : true,
      featured: courseData.featured || false,
      min_students: courseData.min_students || 1,
      sort_order: courseData.sort_order || 0,
      completion_points: courseData.completion_points || 0,
      average_rating: 0,
      total_reviews: 0,
      total_students: 0,
      is_workshop: courseData.type === "Workshop" || courseData.is_workshop || false,
    };

    // Generate slug if not provided
    if (!courseDoc.slug && courseDoc.name) {
      let baseSlug = courseDoc.name
        .toLowerCase()
        .replace(/[^\u0600-\u06FF\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check for existing slug
      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await courses().findOne({ slug });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      courseDoc.slug = slug;
    }

    // Generate meta fields if not provided
    if (!courseDoc.meta_title && courseDoc.name) {
      courseDoc.meta_title = courseDoc.name.substring(0, 70);
    }

    if (!courseDoc.meta_description && courseDoc.description) {
      courseDoc.meta_description = courseDoc.description.substring(0, 160);
    }

    // Convert date strings to Date objects
    if (courseDoc.start_date && typeof courseDoc.start_date === 'string') {
      courseDoc.start_date = new Date(courseDoc.start_date);
    }

    if (courseDoc.end_date && typeof courseDoc.end_date === 'string') {
      courseDoc.end_date = new Date(courseDoc.end_date);
    }

    if (courseDoc.registration_deadline && typeof courseDoc.registration_deadline === 'string') {
      courseDoc.registration_deadline = new Date(courseDoc.registration_deadline);
    }

    // Validate dates
    if (courseDoc.start_date && courseDoc.end_date) {
      if (courseDoc.end_date <= courseDoc.start_date) {
        return {
          success: false,
          message: "تاریخ پایان دوره باید بعد از تاریخ شروع باشد"
        };
      }
    }

    if (courseDoc.registration_deadline && courseDoc.start_date) {
      if (courseDoc.registration_deadline >= courseDoc.start_date) {
        return {
          success: false,
          message: "مهلت ثبت‌نام باید قبل از تاریخ شروع دوره باشد"
        };
      }
    }

    // Handle relations (convert string IDs to ObjectId references)
    const relations: any = {};

    if (courseDoc.featured_image) {
      relations.featured_image = { _id: new ObjectId(courseDoc.featured_image) };
      delete courseDoc.featured_image;
    }

    if (courseDoc.category) {
      relations.category = { _id: new ObjectId(courseDoc.category) };
      delete courseDoc.category;
    }

    if (courseDoc.instructor) {
      relations.instructor = { _id: new ObjectId(courseDoc.instructor) };
      delete courseDoc.instructor;
    }

    if (courseDoc.creator) {
      relations.creator = { _id: new ObjectId(courseDoc.creator) };
      delete courseDoc.creator;
    }

    if (courseDoc.tags && Array.isArray(courseDoc.tags)) {
      relations.tags = courseDoc.tags.map((id: string) => ({ _id: new ObjectId(id) }));
      delete courseDoc.tags;
    }

    if (courseDoc.gallery && Array.isArray(courseDoc.gallery)) {
      relations.gallery = courseDoc.gallery.map((id: string) => ({ _id: new ObjectId(id) }));
      delete courseDoc.gallery;
    }

    if (courseDoc.related_courses && Array.isArray(courseDoc.related_courses)) {
      relations.related_courses = courseDoc.related_courses.map((id: string) => ({ _id: new ObjectId(id) }));
      delete courseDoc.related_courses;
    }

    if (courseDoc.prerequisite_courses && Array.isArray(courseDoc.prerequisite_courses)) {
      relations.prerequisite_courses = courseDoc.prerequisite_courses.map((id: string) => ({ _id: new ObjectId(id) }));
      delete courseDoc.prerequisite_courses;
    }

    // Create the course
    const createdCourse = await courses().insertOne({
      doc: courseDoc,
      relations: Object.keys(relations).length > 0 ? relations : undefined
    });

    if (!createdCourse) {
      return {
        success: false,
        message: "خطا در ایجاد دوره / Error creating course"
      };
    }

    return {
      success: true,
      data: createdCourse,
      message: "دوره با موفقیت ایجاد شد / Course created successfully"
    };

  } catch (error) {
    console.error("Error in createCourse:", error);
    return {
      success: false,
      message: "خطا در ایجاد دوره / Error creating course",
      error: error.message
    };
  }
};

export default createCourseFn;

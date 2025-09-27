import { type ActFn, ObjectId, type TInsertRelations } from "@deps";
import {  enrollment  } from "@app";
import type { enrollment_relations } from "@model";

export const updateEnrollmentFn: ActFn = async (body) => {
  const { set, get } = body.details;

  const { _id, user, course, order, certificate, ...rest } = set;

  const relations: TInsertRelations<typeof enrollment_relations> = {};

  // Handle relation updates
  if (user) {
    relations.user = {
      _ids: new ObjectId(user as string),
    };
  }

  if (course) {
    relations.course = {
      _ids: new ObjectId(course as string),
    };
  }

  if (order) {
    relations.order = {
      _ids: new ObjectId(order as string),
    };
  }

  if (certificate) {
    relations.certificate = {
      _ids: new ObjectId(certificate as string),
    };
  }

  const updatedEnrollment = await enrollment.updateOne({
    filter: { _id: new ObjectId(_id) },
    update: {
      $set: {
        ...rest,
        updated_at: new Date(),
      },
    },
    relations: Object.keys(relations).length > 0 ? relations : undefined,
    projection: get,
  });

  return updatedEnrollment;
};

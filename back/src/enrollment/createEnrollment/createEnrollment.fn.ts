import { type ActFn, ObjectId, type TInsertRelations } from "@deps";
import { enrollment } from "../../../mod.ts";
import type { enrollment_relations } from "@model";

export const createEnrollmentFn: ActFn = async (body) => {
  const { set, get } = body.details;

  const { user, course, order, certificate, ...rest } = set;

  const relations: TInsertRelations<typeof enrollment_relations> = {};

  // Required relations
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

  // Optional relations
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

  const createdEnrollment = await enrollment.insertOne({
    doc: {
      ...rest,
    },
    relations,
    projection: get,
  });

  return createdEnrollment;
};

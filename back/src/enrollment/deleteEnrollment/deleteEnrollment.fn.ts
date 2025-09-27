import { type ActFn, ObjectId } from "@deps";
import {  enrollment  } from "@app";

export const deleteEnrollmentFn: ActFn = async (body) => {
  const { set: { _id }, get } = body.details;

  const deletedEnrollment = await enrollment.deleteOne({
    filter: { _id: new ObjectId(_id) },
    projection: get,
  });

  return deletedEnrollment;
};

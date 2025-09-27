import { type ActFn, ObjectId } from "@deps";
import {  enrollment  } from "@app";

export const getEnrollmentFn: ActFn = async (body) => {
  const { set: { _id }, get } = body.details;

  const foundEnrollment = await enrollment.findOne({
    filter: { _id: new ObjectId(_id) },
    projection: get,
  });

  return foundEnrollment;
};

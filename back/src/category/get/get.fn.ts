import { type ActFn, ObjectId } from "@deps";
import { category } from "../../../mod.ts";

export const getFn: ActFn = async (body) => {
	const {
		set: { _id },
		get,
	} = body.details;

	return await category
		.aggregation({
			pipeline: [{ $match: { _id: new ObjectId(_id as string) } }],
			projection: get,
		})
		.toArray();
};

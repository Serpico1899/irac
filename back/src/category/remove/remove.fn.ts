import { type ActFn, ObjectId } from "@deps";
import { category } from "../../../mod.ts";

export const removeFn: ActFn = async (body) => {
	const {
		set: { _id, hardCascade },
		get,
	} = body.details;

	return await category.deleteOne({
		filter: { _id: new ObjectId(_id as string) },
		hardCascade: hardCascade || false,
	});
};

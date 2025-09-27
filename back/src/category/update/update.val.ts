import { object, objectIdValidation, optional, string } from "@deps";
import {  selectStruct  } from "@app";

export const updateValidator = () => {
	return object({
		set: object({
			_id: objectIdValidation,
			name: optional(string()),
			description: optional(string()),
		}),
		get: selectStruct("category", 1),
	});
};

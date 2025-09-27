import { enums, number, object, optional, string } from "@deps";
import {  selectStruct  } from "@app";

export const getFilesValidator = () => {
	return object({
		set: object({
			page: number(),
			limit: number(),
			name: optional(string()),
			type: optional(enums(["image", "video", "doc"])),
		}),
		get: selectStruct("file", 2),
	});
};

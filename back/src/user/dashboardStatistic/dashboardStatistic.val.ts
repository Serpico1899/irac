import { enums, object, optional } from "@deps";

export const dashboardStatisticValidator = () => {
	return object({
		set: object({}), // This section remains as per your original snippet
		get: object({
			// Existing fields
			users: optional(enums([0, 1])),
			provinces: optional(enums([0, 1])),
			cities: optional(enums([0, 1])),
			city_zones: optional(enums([0, 1])),
			locaions: optional(enums([0, 1])),
			categories: optional(enums([0, 1])),
			tags: optional(enums([0, 1])),
		}),
	});
};

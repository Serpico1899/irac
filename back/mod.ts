import { lesan, MongoClient, redis } from "@deps";
import {
	categories,
	files,
	tags,
	users,
} from "@model";
import { functionsSetup } from "./src/mod.ts";

const MONGO_URI = Deno.env.get("MONGO_URI") || "mongodb://127.0.0.1:27017/";
const REDIS_URI = Deno.env.get("REDIS_URI");

export const myRedis = await redis.connect({
	hostname: REDIS_URI ? "redis" : "127.0.0.1",
	port: 6379,
});

export const coreApp = lesan();
const client = await new MongoClient(MONGO_URI).connect();
const db = client.db("nejat");
coreApp.odm.setDb(db);

export const user = users();
export const file = files();
export const tag = tags();
export const category = categories();

export const { setAct, setService, getAtcsWithServices } = coreApp.acts;

export const { selectStruct, getSchemas } = coreApp.schemas;

functionsSetup();

coreApp.runServer({
	port: 1405,
	typeGeneration: true,
	playground: true,
	staticPath: ["/uploads"],
	cors: [
		"http://localhost:3000",
		"http://localhost:4000",
	],
});

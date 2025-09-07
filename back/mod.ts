import { lesan, MongoClient, redis } from "@deps";
import {
  articles,
  categories,
  courses,
  files,
  order_models,
  product_models,
  tags,
  users,
  wallets,
  wallet_transactions,
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
export const article = articles();
export const course = courses();
export const wallet = wallets();
export const wallet_transaction = wallet_transactions();
export const order = order_models();
export const product = product_models();

export const { setAct, setService, getAtcsWithServices } = coreApp.acts;

export const { selectStruct, getSchemas } = coreApp.schemas;

// Initialize server and wait for it to be ready before setting up routes
await coreApp.runServer({
  port: parseInt(Deno.env.get("APP_PORT") || "1405"),
  typeGeneration: true,
  playground: true,
  staticPath: ["./public"],
  cors: [
    "http://localhost:3000",
    "http://localhost:4000",
  ],
});

// Now that the server is initialized, set up the functions that use HTTP router
functionsSetup();

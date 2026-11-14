import { DataSource } from "typeorm";
import type { Env } from "../config/env";

export function createDataSource(env: Env): DataSource {
  return new DataSource({
    type: "postgres",
    url: env.DATABASE_URL,
    synchronize: false,
    entities: [__dirname + "/entities/*.js"],
    migrations: [__dirname + "/migrations/*.js"],
  });
}

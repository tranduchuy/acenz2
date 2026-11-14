import "reflect-metadata";
import { loadEnv } from "../config/env";
import { createDataSource } from "./create-data-source";

// Entry point for the TypeORM CLI (`typeorm -d dist/db/data-source.js ...`).
export default createDataSource(loadEnv(process.env));

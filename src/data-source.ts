import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";

const DB_TYPE = (process.env.DB_TYPE || 'postgres') as 'postgres' | 'mssql';

export const AppDataSource = new DataSource({
  type: DB_TYPE,
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: true,
  entities: [User],
  extra: DB_TYPE === 'mssql' ? { trustServerCertificate: true } : {},
});
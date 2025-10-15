import type { Knex } from "knex";

const config: Record<string, Knex.Config> = {
  development: {
    client: "pg",
    connection: {
      database: `${process.env.PROJECT_NAME}_${process.env.ENVIRONMENT}`,
      user: `${process.env.DB_USER}`,
      password: `${process.env.DB_PASSWORD}`
    },
    pool: { min: 2, max: 10 },
    migrations: { tableName: "knex_migrations" }
  },
  staging: {
    client: "pg",
    connection: {
      database: `${process.env.PROJECT_NAME}_${process.env.ENVIRONMENT}`,
      user: `${process.env.DB_USER}`,
      password: `${process.env.DB_PASSWORD}`
    },
    pool: { min: 2, max: 10 },
    migrations: { tableName: "knex_migrations" }
  },
  production: {
    client: "pg",
    connection: {
      database: `${process.env.PROJECT_NAME}_${process.env.ENVIRONMENT}`,
      user: `${process.env.DB_USER}`,
      password: `${process.env.DB_PASSWORD}`
    },
    pool: { min: 2, max: 10 },
    migrations: { tableName: "knex_migrations" }
  }
};

export default config;

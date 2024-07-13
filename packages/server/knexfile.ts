import * as dotenv from "dotenv";
dotenv.config();

const migrations = {
    directory: "./migrations",
    extension: "ts",
    stub: "./knex/migration.stub.ts",
};

const seeds = {
    directory: "./seeds",
    extension: "ts",
};

export const develop = {
    client: "mysql",
    useNullAsDefault: true,
    connection: {
        host: "database-1.cp6ukw80wkb2.us-east-1.rds.amazonaws.com",
        user: "admin",
        port: 3306,
        password: "password2024!",
        database: "asset_swap",
        multipleStatements: true,
    },
    migrations,
    seeds,
    userParams: {
        env: "develop",
    },
};

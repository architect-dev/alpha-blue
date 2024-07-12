import * as dotenv from "dotenv";
import { knex, Knex } from "knex";
import MySql from "serverless-mysql";
import { log, LogLevel } from "../utils/logger";

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const knexServerlessMysql = require("knex-serverless-mysql");

export class DatabaseManager {
    private static instance: Knex;
    private static definedInstance: boolean;

    private static initialize() {
        if (this.definedInstance) {
            log(
                "Reusing existing instance of database manager.",
                LogLevel.INFO
            );
            return;
        }

        const mysqlConfig = this.getDatabaseConfig();
        this.instance = knex(mysqlConfig);
        this.definedInstance = true;
    }

    private static getDatabaseConfig() {
        const mysql = MySql({
            config: {
                host: "database-1.cp6ukw80wkb2.us-east-1.rds.amazonaws.com",
                user: "admin",
                port: 3306,
                password: "password2024!",
                database: "asset_swap",
                typeCast: function castField(
                    field: any,
                    useDefaultTypeCasting: any
                ) {
                    if (field.type === "BIT" && field.length === 1) {
                        const bytes = field.buffer();
                        return bytes[0] === 1;
                    }
                    return useDefaultTypeCasting();
                },
            },
        });

        const mysqlConfig = {
            client: knexServerlessMysql,
            mysql,
        };

        return mysqlConfig;
    }

    public static getInstance() {
        if (!this.definedInstance) {
            this.initialize();
        }
        return this.instance;
    }
}

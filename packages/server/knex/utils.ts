import { Knex } from "knex";

export function createdAtUpdatedAtRows(t: Knex.CreateTableBuilder, knex: Knex) {
    const env = knex.userParams.env;

    const rawDefault = "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP";

    t.timestamp("created_at").defaultTo(knex.fn.now());
    t.timestamp("updated_at").defaultTo(knex.raw(rawDefault));

    return t;
}

export function createForeignKey(
    t: Knex.CreateTableBuilder,
    colName: string,
    foreignColName: string,
    foreignTableName: string,
    options?: {
        foreignKeyName?: string;
        createForeignKeyRow?: boolean;
        nullableForeignKey?: boolean;
        onDelete?: string;
        onUpdate?: string;
    }
) {
    if (options?.createForeignKeyRow)
        if (options?.nullableForeignKey) t.integer(colName).unsigned();
        else t.integer(colName).notNullable().unsigned();

    t.foreign(colName, options?.foreignKeyName)
        .references(foreignColName)
        .inTable(foreignTableName)
        .onDelete(options?.onDelete || "RESTRICT")
        .onUpdate(options?.onUpdate || "RESTRICT");

    return t;
}

import { randomUUID } from "crypto";
import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tenants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });

  await knex('tenants').insert({
    id: '42a401e2-7d75-4859-8538-000363fe1b26',
    name: 'Tenant Exemplo'
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('tenants');
}

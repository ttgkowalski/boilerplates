import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('roles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable().unique();
    table.string('description').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });

  // Inserir roles padrão
  await knex('roles').insert([
    { name: 'Admin', description: 'Administrador com acesso total' },
    { name: 'Manager', description: 'Gerente com permissões intermediárias' },
    { name: 'User', description: 'Usuário padrão' },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('roles');
}


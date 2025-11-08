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
    { id: 'ade3e92d-2790-4541-bcdc-6af441174e24', name: 'Admin', description: 'Administrador com acesso total' },
    { id: '29c49062-1286-47fc-80cf-a547f6b77ebc', name: 'Manager', description: 'Gerente com permissões intermediárias' },
    { id: '0eaf6246-d2d6-4cde-ac1c-4821ffc233f8', name: 'User', description: 'Usuário padrão' },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('roles');
}


import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Primeiro, migrar dados existentes para user_roles
  // Buscar todos os usuários com seus roles
  const users = await knex('users').select('id', 'role');
  
  // Buscar os IDs das roles
  const roles = await knex('roles').select('id', 'name');
  const roleMap = new Map(roles.map(r => [r.name, r.id]));
  
  // Inserir roles existentes na tabela user_roles
  for (const user of users) {
    const roleId = roleMap.get(user.role);
    if (roleId) {
      // Verificar se já existe antes de inserir
      const existing = await knex('user_roles')
        .where('user_id', user.id)
        .where('role_id', roleId)
        .first();
      
      if (!existing) {
        await knex('user_roles').insert({
          user_id: user.id,
          role_id: roleId,
          created_at: knex.fn.now(),
        });
      }
    }
  }
  
  // Remover a coluna role da tabela users
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('role');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Adicionar a coluna role de volta
  await knex.schema.alterTable('users', (table) => {
    table.enum('role', ['Admin', 'Manager', 'User']).notNullable().defaultTo('User');
  });
  
  // Migrar dados de volta (pegar a primeira role de cada usuário)
  const userRoles = await knex('user_roles')
    .join('roles', 'user_roles.role_id', 'roles.id')
    .select('user_roles.user_id', 'roles.name as role_name');
  
  const userRoleMap = new Map<string, string>();
  for (const ur of userRoles) {
    if (!userRoleMap.has(ur.user_id)) {
      userRoleMap.set(ur.user_id, ur.role_name);
    }
  }
  
  // Atualizar users com suas roles
  for (const [userId, roleName] of userRoleMap) {
    await knex('users').where('id', userId).update({ role: roleName });
  }
}


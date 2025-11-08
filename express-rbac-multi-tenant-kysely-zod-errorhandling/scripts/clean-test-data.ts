import { db, destroyDb } from "../src/db";

async function cleanTestData() {
  try {
    console.log("🧹 Limpando dados de teste...");

    // Deletar user_roles primeiro (devido à foreign key)
    const deletedUserRoles = await db
      .deleteFrom("user_roles")
      .execute();

    console.log(`✅ ${deletedUserRoles.length} registro(s) deletado(s) de user_roles`);

    // Deletar users
    const deletedUsers = await db
      .deleteFrom("users")
      .execute();

    console.log(`✅ ${deletedUsers.length} registro(s) deletado(s) de users`);

    console.log("✨ Limpeza concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao limpar dados:", error);
    if (error instanceof Error) {
      console.error("   Mensagem:", error.message);
    }
    process.exit(1);
  } finally {
    await destroyDb();
  }
}

cleanTestData();


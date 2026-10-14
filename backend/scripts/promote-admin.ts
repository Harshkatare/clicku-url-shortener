import { eq } from "drizzle-orm";
import { db, pool } from "../src/db/index.js";
import { users } from "../src/db/schema/users.js";

function printUsageAndExit(code = 0): never {
  console.log(`
Usage:
  pnpm admin:promote <email>

Description:
  Promotes an existing registered user to the 'admin' role.

Options:
  --help, -h    Show this help message

Manual SQL Fallback:
  UPDATE users SET role = 'admin' WHERE email = '<email>';
`);
  process.exit(code);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const targetEmail = args[0]?.trim();

  if (!targetEmail || targetEmail === "--help" || targetEmail === "-h") {
    printUsageAndExit(targetEmail ? 0 : 1);
  }

  const normalizedEmail = targetEmail.toLowerCase();

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
      columns: {
        id: true,
        role: true,
      },
    });

    if (!existingUser) {
      console.error(`Error: User with email "${normalizedEmail}" not found.`);
      process.exitCode = 1;
      return;
    }

    if (existingUser.role === "admin") {
      console.log(`User "${normalizedEmail}" is already an admin.`);
      process.exitCode = 0;
      return;
    }

    await db
      .update(users)
      .set({
        role: "admin",
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id));

    console.log(`Successfully promoted "${normalizedEmail}" to admin role.`);
    process.exitCode = 0;
  } catch (err) {
    console.error("Failed to promote user to admin:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();

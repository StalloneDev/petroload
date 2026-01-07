import "dotenv/config";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    try {
        const usersToSeed = [
            { username: "superviseur", password: "petroload!123", role: "admin" },
            { username: "transporteur", password: "transporteur", role: "transporteur" }
        ];

        for (const u of usersToSeed) {
            console.log(`Checking if user '${u.username}' exists...`);
            const existingUser = await db.query.users.findFirst({
                where: eq(users.username, u.username),
            });

            if (existingUser) {
                console.log(`User '${u.username}' already exists. Updating role...`);
                await db.update(users).set({ role: u.role }).where(eq(users.username, u.username));
            } else {
                console.log(`Creating user '${u.username}'...`);
                await db.insert(users).values(u);
                console.log(`User '${u.username}' created successfully.`);
            }
        }
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();

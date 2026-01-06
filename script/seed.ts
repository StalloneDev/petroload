import "dotenv/config";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    try {
        const username = "superviseur";
        const password = "petroload!123";

        console.log(`Checking if user '${username}' exists...`);
        const existingUser = await db.query.users.findFirst({
            where: eq(users.username, username),
        });

        if (existingUser) {
            console.log(`User '${username}' already exists.`);
            // Optional: update password if needed
            // await db.update(users).set({ password }).where(eq(users.username, username));
            // console.log("Password updated.");
        } else {
            console.log(`Creating user '${username}'...`);
            await db.insert(users).values({ username, password });
            console.log("User created successfully.");
        }
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();

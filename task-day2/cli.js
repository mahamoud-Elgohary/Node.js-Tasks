import { Command } from "commander";
import fs from "fs/promises";

const program = new Command();

// Helper to read users.json
async function readUsers() {
  try {
    const data = await fs.readFile("./users.json", "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper to save users.json
async function saveUsers(users) {
  await fs.writeFile("./users.json", JSON.stringify(users, null, 2));
}

// --- Commands ---//

// Add user
program
  .command("add <name>")
  .description("Add a new user")
  .action(async (name) => {
    const users = await readUsers();
    const newUser = { id: Date.now(), name };
    users.push(newUser);
    await saveUsers(users);
    console.log(" user added:", newUser);
  });

// Remove user
program
  .command("remove <id>")
  .description("Remove a user by id")
  .action(async (id) => {
    const users = await readUsers();
    const index = users.findIndex((u) => u.id === parseInt(id));
    if (index === -1) {
      console.error(" User not found");
      return;
    }
    const removed = users.splice(index, 1);
    await saveUsers(users);
    console.log(" User removed:", removed[0]);
  });

// Get all users
program
  .command("getall")
  .description("Get all users")
  .action(async () => {
    const users = await readUsers();
    console.log(" All users:", users);
  });

// Get one user
program
  .command("getone <id>")
  .description("Get one user by id")
  .action(async (id) => {
    const users = await readUsers();
    const user = users.find((u) => u.id === parseInt(id));
    if (!user) {
      console.error(" User not found");
    } else {
      console.log(" User:", user);
    }
  });

// Edit user
program
  .command("edit <id> <newName>")
  .description("Edit a user’s name")
  .action(async (id, newName) => {
    const users = await readUsers();
    const user = users.find((u) => u.id === parseInt(id));
    if (!user) {
      console.error(" User not found");
      return;
    }
    user.name = newName;
    await saveUsers(users);
    console.log(" User updated:", user);
  });


program.parse(process.argv);

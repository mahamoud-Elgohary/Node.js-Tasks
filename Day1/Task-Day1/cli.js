import fs from "fs/promises";

// Read users.json (create empty array if file not found)
let parsedData = [];
try {
  const data = await fs.readFile("./users.json", "utf-8");
  parsedData = JSON.parse(data);
} catch (err) {
  console.log(" users starting with empty array");
  parsedData = [];
}

const [, , action, ...args] = process.argv;

switch (action) {
  //  add 
  case "add": {
    const name = args[0];
    if (!name) {
      console.error(" please enter name ");
      break;
    }
    const newUser = { id: Date.now(), Name: name };
    parsedData.push(newUser);
    await fs.writeFile("./users.json", JSON.stringify(parsedData, null, 2));
    console.log(" User added:", newUser);
    break;
  }

  //  remove 
  case "remove": {
    const id = parseInt(args[0]);
    if (!id) {
      console.error("Please enter valid id");
      break;
    }
    const index = parsedData.findIndex((u) => u.id === id);
    if (index === -1) {
      console.error(` User with id ${id} not found.`);
      break;
    }
    const removed = parsedData.splice(index, 1);
    await fs.writeFile("./users.json", JSON.stringify(parsedData, null, 2));
    console.log(" user removed:", removed[0]);
    break;
  }

  //  get all 
  case "getall": {
    console.log(" All users:", parsedData);
    break;
  }

  // get one user
  case "getone": {
    const id = parseInt(args[0]);
    const user = parsedData.find((u) => u.id === id);
    if (!user) {
      console.error(` User with id ${id} not found.`);
    } else {
      console.log(" user:", user);
    }
    break;
  }

  //  edit user
  case "edit": {
    const id = parseInt(args[0]);
    const newName = args[1];
    if (!id || !newName) {
      console.error(" please neter valid id and name ");
      break;
    }
    const user = parsedData.find((u) => u.id === id);
    if (!user) {
      console.error(` user with id ${id} not found.`);
      break;
    }
    user.Name = newName;
    await fs.writeFile("./users.json", JSON.stringify(parsedData, null, 2));
    console.log(" user updated:", user);
    break;
  }


  default:
    console.log("Your action not right try Use: add | remove | getall | getone | edit");
    break;
}

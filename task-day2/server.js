import http from "http";
import fs from "fs/promises";
import { content } from "./main.js";
console.log("🚀 ~ content:", content);
const PORT = 3000;

const cssContent = await fs.readFile("styles.css", "utf-8");
const users = await fs.readFile("users.json", "utf-8");
const parsedUsers = JSON.parse(users);
const server = http.createServer((req, res) => {
  console.log(req.url);
  const reg = new RegExp(/^\/users\/\d*$/);
  switch (req.method) {
    case "GET":
      switch (req.url) {
        case "/":
          res.writeHead(200, { "Content-Type": "text/html" });

          // Send the response body as 'Hello, World!'
          res.end(content("menna"));

          break;
        case "/styles.css":
          console.log("hello");

          res.writeHead(200, { "Content-Type": "text/css" });
          res.end(cssContent);
          break;
        case "/users":
          res.writeHead(200, { "content-type": "application/json" });
          res.end(users);
          break;
        default:
            if(reg.test(req.url)){
                const id = req.url.split('/')[2];
                console.log("🚀 ~ id:", id)
                const user = parsedUsers.find(u=> u.id === parseInt(id))
                if(!user){
                    res.writeHead(404, {"content-type": "text/plain" })
                    res.end("NOT FOUND");
                }
            res.writeHead(200, { "content-type": "application/json" })
            res.end(JSON.stringify(user));
            break;
            }
          res.writeHead(404);
          res.end(`<h1 style="color='red'"> Error!</h1>`);
          break;
      }
      break;
    case "POST":
      switch (req.url) {
        case "/":
          let body = [];
          req
            .on("data", (chunk) => {
              body.push(chunk);
            })
            .on("end", async () => {
              try {
                body = Buffer.concat(body).toString();
                console.log("🚀 ~ body:", body);
                const user = JSON.parse(body);
                user.id = 1;
                await fs.writeFile(
                  "./users.json",
                  JSON.stringify(user, null, 1)
                );
                res.writeHead(201, { "content-type": "text/plain" });
                res.end("Created");
              } catch (error) {
                res.writeHead(400);
                res.end("error");
              }
            });

          break;

        default:
          break;
      }
      break;

    default:
      res.writeHead(404);
      res.end("invalid method");
      break;
  }
  // Set the response HTTP header with HTTP status and Content type
});

// Define the port to listen on const PORT = 3000;

// Start the server and listen on the specified port
server.listen(PORT, "localhost", () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

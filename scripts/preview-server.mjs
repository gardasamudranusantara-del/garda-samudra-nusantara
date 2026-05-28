import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function resolvePath(urlPath) {
  const cleanPath = urlPath === "/" ? "/preview.html" : urlPath;
  const filePath = normalize(join(root, cleanPath));

  if (!filePath.startsWith(root)) {
    return null;
  }

  return filePath;
}

createServer((request, response) => {
  const url = new URL(request.url || "/", `http://localhost:${port}`);
  const filePath = resolvePath(url.pathname);

  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type": mimeTypes[extname(filePath)] || "application/octet-stream"
  });
  createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Preview running at http://localhost:${port}`);
});

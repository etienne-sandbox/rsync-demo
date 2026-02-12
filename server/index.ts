import { diff } from "@dldc/librsync";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { readFile } from "node:fs/promises";

const formatKB = (bytes: number) => `${(bytes / 1000).toFixed(1)} kB`;

const PORT = 3030;

const app = new Hono();

app.use("*", cors());
app.post("/", async (c) => {
  try {
    const checksum = new Uint8Array(await c.req.arrayBuffer());
    console.log(`Server received checksum: ${formatKB(checksum.byteLength)}`);
    const file = await readFile("./data/synced.txt");
    console.log(`Server read file: ${formatKB(file.byteLength)}`);
    const patch = diff(checksum, file);
    console.log(`Sending patch: ${formatKB(patch.byteLength)}`);
    return c.body(patch, 200, { "Content-Type": "application/octet-stream" });
  } catch (error) {
    console.error(error);
    return c.text("Internal Server Error", 500);
  }
});

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

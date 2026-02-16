import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { sync } from "./sync";

const PORT = 3030;

const app = new Hono();

app.use("*", cors());
app.post("/", async (c) => {
  try {
    return await sync(c);
  } catch (error) {
    console.error(error);
    return c.text("Internal Server Error", 500);
  }
});

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

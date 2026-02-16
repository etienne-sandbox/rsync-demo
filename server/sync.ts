import { diff } from "@dldc/librsync";
import { Context } from "hono";
import { readFile } from "node:fs/promises";

import { padToBlockSize } from "./utils";

/**
 * Server
 */
export async function sync(ctx: Context) {
  const checksum = new Uint8Array(await ctx.req.arrayBuffer());
  const file = await readFile("./data/synced.txt");
  const paddedFile = padToBlockSize(file, 1024);
  const patch = diff(checksum, paddedFile);
  return ctx.body(patch, 200, { "Content-Type": "application/octet-stream" });
}

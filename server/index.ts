import { createServer, IncomingMessage } from "http";
import { Buffer } from "buffer";
import { readFile } from "fs/promises";
import { diff } from "zen-rsync";
import prettyBytes from "pretty-bytes";

const PORT = 3030;

const server = createServer(async (req, res) => {
  const checksum = await reqToBuffer(req);
  console.log(`Server received checksum: ${prettyBytes(checksum.byteLength)}`);
  const file = await readFile("./data/synced.txt");
  console.log(`Server read file: ${prettyBytes(file.byteLength)}`);
  const patch = diff(file, checksum);
  console.log(`Server generated patch: ${prettyBytes(patch.byteLength)}`);
  res.writeHead(200, { "Access-Control-Allow-Origin": "*" });
  res.write(Buffer.from(patch));
  res.end();
});

server.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

async function reqToBuffer(req: IncomingMessage): Promise<Buffer> {
  const chunks = [];
  for await (let chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

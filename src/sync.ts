import { apply, signature } from "@dldc/librsync";

/**
 * Client
 */
export async function sync(signal: AbortSignal, file: Uint8Array<ArrayBufferLike>) {
  const checksum = signature(file);
  const response = await fetch("http://localhost:3030", {
    signal,
    body: checksum,
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const patch = new Uint8Array(await response.arrayBuffer());
  const patched = apply(file, patch);
  return { checksum, patch, patched };
}

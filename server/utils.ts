export function padToBlockSize(file: Uint8Array<ArrayBufferLike>, blockSize: number) {
  const remainder = file.length % blockSize;
  if (remainder === 0) {
    return file;
  }
  const padded = new Uint8Array(file.length + (blockSize - remainder));
  padded.set(file);
  return padded;
}

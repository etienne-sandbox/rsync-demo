import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { apply, prepare } from "zen-rsync";
import prettyBytes from "pretty-bytes";

export function App() {
  const [file, setFile] = useState<ArrayBuffer>(() => new ArrayBuffer(0));

  const [logs, setLogs] = useState<
    Array<{ time: Date; checksum: number; patch: number; file: number }>
  >([]);

  const [auto, setAuto] = useState(false);

  const log = useCallback((checksum: number, patch: number, file: number) => {
    setLogs((logs) => [{ time: new Date(), checksum, file, patch }, ...logs]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const fileRef = useRef(file);
  useEffect(() => {
    fileRef.current = file;
  }, [file]);

  const sync = useCallback(async () => {
    const file = fileRef.current;
    const blockSize = 512;
    const checksum = prepare(file, blockSize);
    const controller = new AbortController();
    const signal = controller.signal;
    // log(`↑ Sending checksum`, checksum.byteLength);
    fetch("http://localhost:3030", {
      signal,
      body: checksum,
      method: "POST",
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const patch = await response.arrayBuffer();
      // log(`↓ Received patch`, patch.byteLength);
      if (controller.signal.aborted) {
        return;
      }
      const patched = apply(file, patch);
      // log(`Patched file`, patched.byteLength);
      log(checksum.byteLength, patch.byteLength, patched.byteLength);
      setFile(patched);
    });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!auto) {
      return;
    }
    sync();
    const timer = setInterval(sync, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [auto, sync]);

  const fileContent = new TextDecoder().decode(file);

  return (
    <Fragment>
      <div className="bg-white flex-1 rounded-md shadow-md overflow-hidden relative">
        <pre className="overflow-auto p-4 absolute inset-0 whitespace-pre-wrap">
          {fileContent.length === 0 ? (
            <span className="text-gray-400">[EMPTY FILE]</span>
          ) : (
            fileContent
          )}
        </pre>
      </div>
      <div className="w-[400px] flex flex-col gap-4">
        <button
          className="rounded-md shadow-md bg-emerald-400 p-2 uppercase tracking-wider font-bold text-lg hover:bg-emerald-500"
          onClick={sync}
        >
          Sync
        </button>
        <button
          className={`rounded-md shadow-md p-2 uppercase tracking-wider font-bold text-lg ${
            auto
              ? `bg-emerald-400 hover:bg-emerald-500`
              : `bg-gray-200 hover:bg-gray-300`
          }`}
          onClick={() => setAuto((auto) => !auto)}
        >
          {auto ? "Stop" : "Start"} auto sync
        </button>
        <div className="flex-1 bg-white py-4 rounded-md shadow-md flex flex-col gap-4 overflow-hidden">
          <button
            className="mx-4 rounded-md bg-gray-200 text-gray-700 p-2 uppercase tracking-wider font-bold text-lg hover:bg-gray-300"
            onClick={clearLogs}
          >
            Clear
          </button>
          <p className="mx-4 text-gray-700 flex flex-row justify-between">
            <span className="text-gray-400 text-center w-20">Date</span>
            <span className="text-gray-400 text-center w-20">Checksum</span>
            <span className="text-gray-400 text-center w-20">Patch</span>
            <span className="text-gray-400 text-center w-20">File</span>
          </p>
          <div className="px-4 flex flex-col gap-1 overflow-auto flex-1">
            {logs.map((log, index) => (
              <p
                key={index}
                className="text-gray-700 flex flex-row justify-between"
              >
                <span className="text-gray-400 inline-block w-20">
                  {log.time.toLocaleTimeString()}
                </span>
                <span className="font-bold inline-block w-20 text-center">
                  ↑ {prettyBytes(log.checksum)}
                </span>
                <span className="font-bold inline-block w-20 text-center">
                  ↓ {prettyBytes(log.patch)}
                </span>
                <span className="font-bold inline-block w-20 text-center">
                  {prettyBytes(log.file)}
                </span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </Fragment>
  );
}

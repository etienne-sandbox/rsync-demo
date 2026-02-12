import { apply, signature } from "@dldc/librsync";
import prettyBytes from "pretty-bytes";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

export function App() {
  const [file, setFile] = useState<Uint8Array>(() => new Uint8Array(0));

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
    const checksum = signature(file);
    console.log(checksum);
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
      const patch = new Uint8Array(await response.arrayBuffer());
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
  }, [log]);

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
      <div className="w-100 flex flex-col gap-4">
        <button
          className="rounded-md shadow-md bg-emerald-400 p-2 uppercase tracking-wider font-bold text-lg hover:bg-emerald-500"
          onClick={sync}
        >
          Sync
        </button>
        <button
          className={`rounded-md shadow-md p-2 uppercase tracking-wider font-bold text-lg ${
            auto ? `bg-emerald-400 hover:bg-emerald-500` : `bg-gray-200 hover:bg-gray-300`
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
            <span className="text-gray-400 text-start w-20">Date</span>
            <span className="text-gray-400 text-end w-20">Checksum</span>
            <span className="text-gray-400 text-end w-20">Patch</span>
            <span className="text-gray-400 text-end w-20">File</span>
          </p>
          <div className="px-4 flex flex-col gap-1 overflow-auto flex-1">
            {logs.map((log, index) => (
              <p key={index} className="text-gray-700 flex flex-row justify-between">
                <span className="text-gray-400 inline-block w-20">
                  {log.time.toLocaleTimeString("fr-FR")}
                </span>
                <span className="font-bold inline-block w-20 text-end">
                  ↑ {prettyBytes(log.checksum)}
                </span>
                <span className="font-bold inline-block w-20 text-end">
                  ↓ {prettyBytes(log.patch)}
                </span>
                <span className="font-bold inline-block w-20 text-end">
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

import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import { Card } from "./Card";
import { sync } from "./sync";

const formatKB = (bytes: number) => (
  <Fragment>
    {(bytes / 1000).toFixed(1)} <span className="text-gray-400">kB</span>
  </Fragment>
);

export function Sync() {
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

  const triggerSync = useCallback(async () => {
    const file = fileRef.current;
    const controller = new AbortController();
    const signal = controller.signal;
    sync(signal, file).then((result) => {
      if (!result || signal.aborted) {
        return;
      }
      const { checksum, patch, patched } = result;
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
    triggerSync();
    const timer = setInterval(triggerSync, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [auto, triggerSync]);

  const fileContent = new TextDecoder().decode(file);

  return (
    <div className="grid grid-cols-[3fr_1fr] gap-4 overflow-hidden">
      <Card className="flex-1 relative">
        <pre className="overflow-auto p-4 absolute inset-0 whitespace-pre-wrap">
          {fileContent.length === 0 ? (
            <span className="text-gray-400">[EMPTY FILE]</span>
          ) : (
            fileContent
          )}
        </pre>
      </Card>
      <div className="flex flex-col gap-4">
        <button
          className="rounded-md shadow-md bg-emerald-400 p-2 uppercase tracking-wider font-bold text-lg hover:bg-emerald-500"
          onClick={triggerSync}
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
        <Card className="flex-1 py-4 flex flex-col gap-4">
          <button
            className="mx-4 rounded-md bg-gray-200 text-gray-700 p-2 uppercase tracking-wider font-bold text-lg hover:bg-gray-300"
            onClick={clearLogs}
          >
            Clear
          </button>
          <p className="mx-4 text-gray-700 flex flex-row justify-between">
            <span className="text-gray-400 text-start w-30">Date</span>
            <span className="text-gray-400 text-end w-30">Checksum</span>
            <span className="text-gray-400 text-end w-30">Patch</span>
            <span className="text-gray-400 text-end w-30">File</span>
          </p>
          <div className="px-4 flex flex-col gap-1 overflow-auto flex-1">
            {logs.map((log, index) => (
              <p key={index} className="text-gray-700 flex flex-row justify-between">
                <span className="text-gray-400 inline-block w-30">
                  {log.time.toLocaleTimeString("fr-FR")}
                </span>
                <span className="font-bold inline-block w-30 text-end">
                  {formatKB(log.checksum)} ↑
                </span>
                <span className="font-bold inline-block w-30 text-end">
                  {formatKB(log.patch)} ↓
                </span>
                <span className="font-bold inline-block w-30 text-end">{formatKB(log.file)}</span>
              </p>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

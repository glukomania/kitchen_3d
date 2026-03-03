import { useEffect, useState } from "react";
import {
  getHostProductList,
  type HostStoreScanResult
} from "@/shared/utils/hostStoreScan";

export function HostStorePreview() {
  const [result, setResult] = useState<HostStoreScanResult | null>(null);

  useEffect(() => {
    const doc = typeof document !== "undefined" ? document : null;
    setResult(getHostProductList(doc));
  }, []);

  if (result === null) return null;

  return (
    <div className="configurator-host-store-preview mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
      {result.found ? (
        <>
          <div className="configurator-host-store-preview-title font-medium">
            Store data (from host page): found {result.count} product
            {result.count !== 1 ? "s" : ""}
          </div>
          {result.items.length > 0 && (
            <ul className="configurator-host-store-preview-list mt-2 list-inside list-disc space-y-0.5">
              {result.items.slice(0, 8).map((item, i) => (
                <li key={i}>{item.name}</li>
              ))}
              {result.count > 8 && (
                <li className="text-slate-500">… and {result.count - 8} more</li>
              )}
            </ul>
          )}
        </>
      ) : (
        <div className="configurator-host-store-preview-empty text-slate-500">
          Host container <code className="rounded bg-slate-200 px-1">#products-1</code> not
          found on this page.
        </div>
      )}
    </div>
  );
}

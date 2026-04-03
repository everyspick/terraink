import type { IPlatformAdapter } from "./ports";
import { webPlatformAdapter } from "./webPlatformAdapter";

let _adapter: IPlatformAdapter = webPlatformAdapter;

export function setPlatformAdapter(adapter: IPlatformAdapter): void {
  _adapter = adapter;
}

export function getPlatformAdapter(): IPlatformAdapter {
  return _adapter;
}

export function isNativePlatform(): boolean {
  return _adapter.isNative;
}

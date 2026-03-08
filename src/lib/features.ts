export interface FeatureFlags {
  oneTimeBox: boolean;
}

const FEATURE_FLAGS_KEY = "meatng-feature-flags";
const FEATURE_FLAGS_EVENT = "meatng-feature-flags-changed";

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  oneTimeBox: true,
};

function readFeatureFlags(): FeatureFlags {
  if (typeof window === "undefined") return DEFAULT_FEATURE_FLAGS;

  try {
    const raw = window.localStorage.getItem(FEATURE_FLAGS_KEY);
    if (!raw) return DEFAULT_FEATURE_FLAGS;
    const parsed = JSON.parse(raw) as Partial<FeatureFlags>;
    return {
      ...DEFAULT_FEATURE_FLAGS,
      ...parsed,
    };
  } catch {
    return DEFAULT_FEATURE_FLAGS;
  }
}

function writeFeatureFlags(flags: FeatureFlags): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FEATURE_FLAGS_KEY, JSON.stringify(flags));
  window.dispatchEvent(new Event(FEATURE_FLAGS_EVENT));
}

export function getFeatureFlags(): FeatureFlags {
  return readFeatureFlags();
}

export function isOneTimeBoxEnabled(): boolean {
  return readFeatureFlags().oneTimeBox;
}

export function setOneTimeBoxEnabled(enabled: boolean): void {
  const current = readFeatureFlags();
  writeFeatureFlags({
    ...current,
    oneTimeBox: enabled,
  });
}

export function subscribeToFeatureFlags(onChange: (flags: FeatureFlags) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const notify = () => onChange(readFeatureFlags());
  const onStorage = (event: StorageEvent) => {
    if (event.key === FEATURE_FLAGS_KEY) notify();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(FEATURE_FLAGS_EVENT, notify);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(FEATURE_FLAGS_EVENT, notify);
  };
}

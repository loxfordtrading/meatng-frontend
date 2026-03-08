const readPath = (obj: unknown, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[part];
  }, obj);
};

export interface JsonApiItem {
  id: string;
  attributes: Record<string, unknown>;
}

export const mapJsonApiItem = (payload: unknown): JsonApiItem => {
  const data = (readPath(payload, "data") || payload) as Record<string, unknown>;
  const id = typeof data?.id === "string" ? data.id : "";
  const attributes =
    (readPath(data, "attributes") as Record<string, unknown>) ||
    (readPath(payload, "attributes") as Record<string, unknown>) ||
    {};
  return { id, attributes: attributes || {} };
};

export const mapJsonApiList = (payload: unknown): JsonApiItem[] => {
  const data = readPath(payload, "data");
  if (!Array.isArray(data)) return [];
  return data.map((item) => mapJsonApiItem(item));
};

import { apiRequest } from "@/lib/api/client";

export interface Address {
  id: string;
  addressType?: string;
  label?: string;
  streetAddress?: string;
  apartmentSuite?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AddressApiPayload {
  data?: unknown;
}

interface AddressListApiPayload {
  data?: unknown[];
}

export interface AddressInput {
  addressType?: string;
  label?: string;
  streetAddress?: string;
  apartmentSuite?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  isDefault?: boolean;
}

const readPath = (obj: unknown, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[part];
  }, obj);
};

const asString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const asBoolean = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

const mapAddress = (payload: unknown): Address => {
  const attributes =
    readPath(payload, "attributes") ||
    readPath(payload, "data.attributes") ||
    readPath(payload, "data.relationships.data.data.attributes") ||
    {};

  const id =
    asString(readPath(payload, "id")) ||
    asString(readPath(payload, "data.id")) ||
    "";

  const obj = (attributes && typeof attributes === "object" ? attributes : {}) as Record<string, unknown>;

  return {
    id,
    addressType: asString(obj.address_type),
    label: asString(obj.label),
    streetAddress: asString(obj.street_address),
    apartmentSuite: asString(obj.apartment_suite),
    city: asString(obj.city),
    state: asString(obj.state),
    zipCode: asString(obj.zip_code),
    country: asString(obj.country),
    isDefault: asBoolean(obj.is_default),
    createdAt: asString(obj.createdAt),
    updatedAt: asString(obj.updatedAt),
  };
};

const buildAddressBody = (input: AddressInput): Record<string, unknown> => {
  const body: Record<string, unknown> = {};
  if (input.addressType) body.address_type = input.addressType;
  if (input.label) body.label = input.label;
  if (input.streetAddress) body.street_address = input.streetAddress;
  if (input.apartmentSuite) body.apartment_suite = input.apartmentSuite;
  if (input.city) body.city = input.city;
  if (input.state) body.state = input.state;
  if (input.zipCode) body.zip_code = input.zipCode;
  if (input.country) body.country = input.country;
  if (typeof input.isDefault === "boolean") body.is_default = input.isDefault;
  return body;
};

export const listAddresses = async (token?: string | null): Promise<Address[]> => {
  const response = await apiRequest<AddressListApiPayload>("/addresses", {
    method: "GET",
    token,
  });
  if (!response?.data || !Array.isArray(response.data)) return [];
  return response.data.map((item) => mapAddress(item));
};

export const createAddress = async (input: AddressInput, token?: string | null): Promise<Address> => {
  const response = await apiRequest<AddressApiPayload>("/addresses", {
    method: "POST",
    body: buildAddressBody(input),
    token,
  });
  return mapAddress(response);
};

export const updateAddress = async (
  id: string,
  input: AddressInput,
  token?: string | null,
): Promise<Address> => {
  const response = await apiRequest<AddressApiPayload>(`/addresses/${id}`, {
    method: "PATCH",
    body: buildAddressBody(input),
    token,
  });
  return mapAddress(response);
};

export const deleteAddress = async (id: string, token?: string | null): Promise<void> => {
  await apiRequest<unknown>(`/addresses/${id}`, {
    method: "DELETE",
    token,
  });
};

export const setDefaultAddress = async (id: string, token?: string | null): Promise<Address> => {
  const response = await apiRequest<AddressApiPayload>(`/addresses/${id}/set-default`, {
    method: "PATCH",
    token,
  });
  return mapAddress(response);
};

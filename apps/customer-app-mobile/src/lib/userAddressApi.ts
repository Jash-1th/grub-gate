import api from './api';

export type AddressType = 'home' | 'work' | 'other';

export type SavedAddress = {
  _id?: string;
  id?: string;
  type?: AddressType;
  label?: string;
  street?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  instructions?: string;
  isDefault?: boolean;
};

export type AddressPayload = {
  type: AddressType;
  label: string;
  street: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  instructions?: string;
  isDefault?: boolean;
};

type AddressResult =
  | { success: true; addresses: SavedAddress[] }
  | { success: false; error: string };

export async function getUserAddresses(): Promise<AddressResult> {
  try {
    const response = await api.get('/users/addresses');
    return {
      success: true,
      addresses: extractAddresses(response.data),
    };
  } catch (error) {
    return {
      success: false,
      error: getApiError(error, 'Failed to load addresses.'),
    };
  }
}

export async function addUserAddress(address: AddressPayload): Promise<AddressResult> {
  try {
    const response = await api.post('/users/addresses', address);
    return {
      success: true,
      addresses: extractAddresses(response.data),
    };
  } catch (error) {
    return {
      success: false,
      error: getApiError(error, 'Failed to save address.'),
    };
  }
}

export async function updateUserAddress(addressId: string, address: AddressPayload): Promise<AddressResult> {
  try {
    const response = await api.patch(`/users/addresses/${addressId}`, address);
    return {
      success: true,
      addresses: extractAddresses(response.data),
    };
  } catch (error) {
    return {
      success: false,
      error: getApiError(error, 'Failed to update address.'),
    };
  }
}

export function getAddressId(address?: SavedAddress | null) {
  return address?._id || address?.id || null;
}

function extractAddresses(responseData: unknown) {
  const shaped = responseData as { data?: { addresses?: unknown } };
  return Array.isArray(shaped?.data?.addresses) ? shaped.data.addresses as SavedAddress[] : [];
}

function getApiError(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string; error?: string } } }).response;
    return response?.data?.message || response?.data?.error || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}

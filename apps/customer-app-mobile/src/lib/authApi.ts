import api from './api';

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type SignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'customer';
};

export async function loginCustomer(payload: LoginPayload) {
  const response = await api.post('/auth/login', payload);
  return response.data;
}

export async function signupCustomer(payload: SignupPayload) {
  const response = await api.post('/auth/register', payload);
  return response.data;
}

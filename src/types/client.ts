export type UserRole = "ADMIN" | "SUPPLIER" | "CUSTOMER";

export interface Client {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  role: UserRole;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  address: string
  password: string
  confirmPassword: string
  role: UserRole
}


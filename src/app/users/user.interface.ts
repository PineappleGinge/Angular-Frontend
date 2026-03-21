export interface User {
  _id?: number;
  name: string;
  phonenumber: string;
  email: string;
  password?: string;
  dob?: Date | null;
  dateJoined?: Date | null;
  lastUpdated?: Date | null;
  role?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  phonenumber: string;
  dob: string;
  password: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  phonenumber: string;
  dob: string;
}

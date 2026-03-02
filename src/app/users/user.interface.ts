export interface User {
  _id?: number;
  name: string;
  phonenumber: string;
  email: string;
  dob?: Date | null;
  dateJoined?: Date | null;
  lastUpdated?: Date | null;
  role?: string;
}


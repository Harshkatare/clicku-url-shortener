export type LoginInput = {
    email: string;
    password: string;
};

export type RegisterInput = {
    name: string;
    email: string;
    password: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
};

export type MeResponse = {
  success: boolean;
  data: User;
};

export type AuthResponse = {
  success: boolean;
  data: {
    token: string;
  };
};
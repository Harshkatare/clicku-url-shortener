export type LoginInput = {
    email: string;
    password: string;
};

export type RegisterInput = {
    name: string;
    email: string;
    password: string;
};

export type AuthResponse = {
  success: boolean;
  data: {
    token: string;
  };
};
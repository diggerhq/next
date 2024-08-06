export type UserRoles = {
  ANON: 'anon';
  ADMIN: 'admin';
  USER: 'user';
};

export type UserRole = UserRoles[keyof UserRoles];

export type EnvVar = {
  id: string;
  name: string;
  value: string;
  is_secret: boolean;
  updated_at: string;
};

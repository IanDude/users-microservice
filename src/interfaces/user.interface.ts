interface base {
  id: number;
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}

export interface User extends base {
  username: string;
  email: string;
  password?: string;
}

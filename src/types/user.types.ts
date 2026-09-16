export interface User {
  id: string;
  google_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  google_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

export interface UserProfile {
  _id: string;
  username: string;
  role: 'admin' | 'staff';
  theme: 'light' | 'dark';
  avatarSeed: string | 'default';
}

export interface PasswordChangeForm {
  current: string;
  new: string;
  confirm: string;
}

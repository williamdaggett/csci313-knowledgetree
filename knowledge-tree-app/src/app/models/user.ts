export interface AppUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name: string;
  providers: {
    provider: 'google' | 'local';
    providerId: string;
  }[];
}

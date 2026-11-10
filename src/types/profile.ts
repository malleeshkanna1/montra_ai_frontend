export interface Profile {
  name: string;
  username: string;
  email: string;
  wallet_balance: number;
  target_saving_monthly: number;
}

export interface LayoutContext {
  refreshProfile: () => Promise<Profile | null>;
}
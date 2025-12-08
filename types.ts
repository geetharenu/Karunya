
export type ViewState = 'ENTRANCE' | 'SCRATCH' | 'LOBBY' | 'ADMIN';

export interface Photo {
  id: string;
  url: string;
  caption: string;
}

export interface SiteConfig {
  birthdayPersonName: string;
  mainMessage: string;
  customBirthdayMessage?: string; // New field
  themeColor: string;
  showConfetti: boolean;
  adminPassword?: string;
  googleClientId?: string;
  birthdayDate: string;
}

export interface AppData {
  config: SiteConfig;
  photos: Photo[];
}

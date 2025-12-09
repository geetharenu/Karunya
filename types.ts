
export type ViewState = 'ENTRANCE' | 'SCRATCH' | 'LOBBY' | 'ADMIN';

export interface Photo {
  id: string;
  url: string;
  caption: string;
}

export interface SiteConfig {
  birthdayPersonName: string;
  mainMessage: string;
  customBirthdayMessage?: string;
  themeColor: string;
  showConfetti: boolean;
  enableScratchCard?: boolean; // New field to control flow
  adminPassword?: string;
  googleClientId?: string;
  birthdayDate: string;
}

export interface AppData {
  config: SiteConfig;
  photos: Photo[];
}

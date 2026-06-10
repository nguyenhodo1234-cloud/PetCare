export interface Service {
  id: string;
  icon: string;
  titleKey: string;
  descKey: string;
}

export interface Vet {
  id: string;
  name: string;
  specialtyKey: string;
  rating: number;
  reviews: number;
  locationKey: string;
  available: boolean;
  avatar: string;
}

export interface NavLink {
  labelKey: string;
  href: string;
}

export type Lang = 'en' | 'vi';

export interface Speaker {
  name: string;
  email: string;
}

interface BaseConfig {
  title: string;
  subtitle?: string;
  slug: string;
  speakers: Speaker[];
  adminOnly?: boolean;
  password?: string;
  hideQA?: boolean;
  presented?: boolean;
  event?: {
    name: string;
    location: string;
    date: string;
  };
}

export interface SlideSection {
  label: string;
  startSlide: number;
}

export interface AutoLoopConfig {
  startSlide: number;
  endSlide: number;
  intervalMs: number;
  overrides?: Record<number, number>;
}

export interface SlidesConfig extends BaseConfig {
  type: 'slides';
  slides: React.FC[];
  notes?: string[];
  sections?: SlideSection[];
  autoLoop?: AutoLoopConfig;
}

export type PresentationConfig = SlidesConfig;

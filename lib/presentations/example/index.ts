import type { SlidesConfig } from '../types';
import { TitleSlide, ContentSlide, FeaturesSlide, ClosingSlide } from './slides';

export const presentation: SlidesConfig = {
  type: 'slides',
  title: 'Welcome to Live Slides',
  subtitle: 'A real-time presentation platform',
  slug: 'example',
  speakers: [
    { name: 'Presenter', email: '' },
  ],
  slides: [TitleSlide, ContentSlide, FeaturesSlide, ClosingSlide],
  notes: [
    'Welcome everyone! This is the title slide.',
    'Explain the core concept of real-time slide sync.',
    'Walk through each feature and demonstrate live Q&A.',
    'Thank the audience and open up for questions.',
  ],
};

import type { Metadata } from 'next';
import { presentations } from '@/lib/presentations';
import PresentationClient from './PresentationClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const presentation = presentations.find((p) => p.slug === slug);

  if (!presentation) {
    return { title: 'Not Found' };
  }

  return {
    title: presentation.title,
    description: presentation.subtitle || 'A live presentation',
  };
}

export default function PresentationPage() {
  return <PresentationClient />;
}

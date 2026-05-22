import { setRequestLocale } from 'next-intl/server';
import {
  HeroVideo,
  StatsBar,
  ServicesGrid,
  GaleriePreview,
  BoutiqueVedette,
  Manifesto,
  Newsletter,
} from '@/components/home';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroVideo />
      <StatsBar />
      <ServicesGrid />
      <GaleriePreview />
      <BoutiqueVedette />
      <Manifesto />
      <Newsletter />
      {/* Sections suivantes à venir */}
    </>
  );
}

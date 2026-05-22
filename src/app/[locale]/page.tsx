import { setRequestLocale } from 'next-intl/server';
import {
  HeroVideo,
  StatsBar,
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
      <Manifesto />
      <Newsletter />
      {/* Sections suivantes à venir */}
    </>
  );
}

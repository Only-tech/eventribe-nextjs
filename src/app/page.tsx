import SplashScreenBase from '@/app/ui/SplashScreenBase';
import { fetchEventImageUrls } from '@/app/lib/data-access/events';


export default async function HomePage() {
  const imageUrls = await fetchEventImageUrls();

  return (
    <SplashScreenBase 
      imageUrls={imageUrls} 
      title="Bienvenue sur eventribe"
      redirectTo="/events"
    />
  );
}


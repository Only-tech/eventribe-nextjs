import SplashScreen from '@/app/ui/SplashScreen';
import { fetchEventImageUrls } from '@/app/lib/data-access/events';


export default async function HomePage() {
  const imageUrls = await fetchEventImageUrls();

  return (
    <SplashScreen imageUrls={imageUrls} />
  );
}


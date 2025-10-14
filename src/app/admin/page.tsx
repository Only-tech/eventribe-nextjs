import SplashScreenBase from '@/app/ui/SplashScreenBase';
import { fetchEventImageUrls } from '@/app/lib/data-access/events';

export default async function AdminHomePage() {
    const imageUrls = await fetchEventImageUrls();
    
    return (
        <SplashScreenBase
            imageUrls={imageUrls}
            title="Administrateur eventribe"
            redirectTo="/admin/dashboard"
            backgroundClass="[background-color:#FCFFF7]/85 bg-[url('/images/SplashPaintBlueLight.svg')]"
        />
    );
}


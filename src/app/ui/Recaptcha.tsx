import { useEffect } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function Recaptcha({ onVerify }: { onVerify: (token: string) => void }) {
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    const verify = async () => {
      if (!executeRecaptcha) return;
      const token = await executeRecaptcha('register');
      onVerify(token);
    };
    verify();
  }, [executeRecaptcha, onVerify]);

  return null;
}

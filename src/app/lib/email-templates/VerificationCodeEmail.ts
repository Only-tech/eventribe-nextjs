import { EmailFooter } from "@/app/lib/email-templates/EmailFooter";

export function VerificationCodeEmail(code: string, recipientEmail: string): string {
    return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" 
            style="background-color:#f3f4f6;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;border-radius:8px;overflow:hidden;">
            <tbody>
                <tr>
                    <td align="center">
                        <!-- Email container -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" 
                            style="background-color:#fff;border:1px solid #E3E5DF;border-radius:8px;overflow:hidden;">
                            <tbody>
                                <tr>
                                    <td style="background-color:#E3E5DF;padding:0 12px;border-top-right-radius:8px;border-top-left-radius:8px;">
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <!-- Logo -->
                                                <td align="left" style="padding:8px;">
                                                    <img src="https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/SplashPaintEventribeLogo.svg" 
                                                        alt="eventribe" width="80" style="display:block;max-width:100%;height:auto;" />
                                                </td>
                                                <!-- Name + avatar -->
                                                <td align="right" style="padding:8px;">
                                                    <table cellpadding="0" cellspacing="0" border="0">
                                                        <tr>
                                                            <td style="color:#000;font-size:16px;font-weight:500;padding-right:8px;white-space:nowrap;">
                                                                Votre code
                                                            </td>
                                                            <td>
                                                                <img src="https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/UserLogo.svg"
                                                                    alt="user" width="32" height="32" 
                                                                    style="display:block;max-width:100%;height:auto;" />
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="max-width:600px;padding:15px 20px;text-align:left;">
                                        <h1 style="font-size:22px;font-weight:bold;margin-bottom:16px">Vérifiez votre identité</h1>
                                        <p style="margin:0 0 12px 0;">Bonjour,</p>
                                        <p style="margin:0 0 12px 0;">Vous avez demandé un code de vérification pour ${recipientEmail}.</p>
                                        <p>Voici votre code :</p>
                                        <p style="font-size:28px;font-weight:bold;background-color:#f8f8ec;padding:10px 20px;margin:12px 60px;border-radius:8px;display:inline-block;box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);white-space: nowrap;">${code}</p>
                                        <p style="margin:0 0 12px 0;">Ce code est valable pendant <strong>10 minutes</strong>.</p>
                                        <p style="margin-top:24px;color:#666;font-size:13px;">
                                        — L’équipe eventribe
                                        </p>
                                    </td>
                                </tr>
                                ${EmailFooter()}
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    `;
}

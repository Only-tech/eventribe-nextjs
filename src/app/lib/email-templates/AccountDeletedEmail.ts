import { EmailHeader } from "@/app/lib/email-templates/EmailHeader";
import { EmailFooter } from "@/app/lib/email-templates/EmailFooter";

export function AccountDeletedEmail(firstName: string, lastName: string) {
    return `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" 
            style="background-color:#f5f5f5;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;border-radius:8px;overflow:hidden;">
            <tbody>
                <tr>
                    <td align="center">
                        <!-- Email container -->
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" 
                            style="background-color:#fff;border:1px solid #E3E5DF;border-radius:8px;overflow:hidden;">
                            <tbody>
                                ${EmailHeader(firstName, lastName)}
                                <tr>
                                    <td style="max-width:600px;padding:15px 20px;text-align:left;">
                                        <h1 style="font-size:22px;font-weight:bold;margin-bottom:16px">Au revoir ${firstName} ${lastName},</h1>
                                        <p style="margin:0 0 12px 0;">Votre compte <strong>eventribe</strong> a bien été supprimé.</p>
                                        <p style="margin:0 0 12px 0;line-height: 1.5;">Nous sommes désolés de vous voir partir, mais nous vous remercions sincèrement d’avoir fait partie de notre communauté.</p>
                                        <p style="margin:0 0 12px 0;line-height: 1.5;">Si vous changez d’avis, vous serez toujours le bienvenu pour revenir et recréer un compte.</p>
                                        <p style="margin:20px 12px 12px 10px;"><a href="https://eventribe.vercel.app/register" style="background-color: #1e2939; padding:8px 15px; color: #fff; border-radius: 9999px; text-decoration: none; font-weight: bold; box-shadow: 0px 5px 5px rgba(0,0,0,0.2);white-space:nowrap;">Rejoindre à nouveau eventribe</a></p>
                                        <p style="margin-top: 32px; font-size: 14px; color: #666;">
                                            Si vous avez des questions, n’hésitez pas à nous contacter : 
                                            <a href="mailto:support@eventribe.com" style="color:#ff952a; text-decoration:none;">support@eventribe.com</a>
                                        </p>
                                        <p style="margin-top:24px;color:#666;font-size:13px;">
                                        Merci encore pour votre confiance,<br/>— L’équipe eventribe
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
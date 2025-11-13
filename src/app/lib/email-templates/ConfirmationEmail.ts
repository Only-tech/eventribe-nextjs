import { EmailHeader } from "@/app/lib/email-templates/EmailHeader";
import { EmailFooter } from "@/app/lib/email-templates/EmailFooter";

export function ConfirmationEmail(
  firstName: string,
  lastName: string,
  title: string,
  event_date: string,
  location: string,
  price: string
): string {
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
                                <td style="max-width:600px;padding:20px;text-align:left;">
                                    <h1 style="font-size:22px;font-weight:bold;margin-bottom:16px">Confirmation d’inscription</h1>
                                    <p>Bonjour ${firstName},</p>
                                    <p>Votre inscription à l’événement <strong>${title}</strong> a bien été enregistrée.</p>
                                    <p>Nous sommes ravis de vous compter parmi nous !</p>

                                    <!-- Ticket container -->
                                    <table width="100%" cellpadding="12" cellspacing="0"
                                        style="margin-top:24px;background-color:#222;color:#fff;border-radius:8px;overflow:hidden;border:1px dashed #333;box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);">
                                        <tbody>
                                            <tr align="center">
                                                <td colspan="2" style="font-size:16px;font-weight:medium;padding:10px 20px;">
                                                    Billet Électronique
                                                </td>
                                            </tr>
                                            <tr style="border-top:1px dashed #333;">
                                                <td style="padding:10px 20px;border-top:1px dashed #333;">
                                                    <p style="margin:0;font-size:14px;"> ${firstName} <strong> ${lastName}</strong></p>
                                                    <p style="margin-top:5px;font-size:14px;"> ${title}</p>
                                                </td>
                                                <td style="padding:10px 20px;text-align:right;border-top:1px dashed #333;">
                                                    <p style="margin:0;font-size:12px;text-transform:uppercase;">TOTAL TTC</p>
                                                    <p style="margin-top:5px;font-size:16px;font-weight:bold;">${price}</p>
                                                </td>
                                            </tr>
                                            <tr width="100%">
                                                <td colspan="2" style="padding:10px 15px 10px 15px;border-top:1px dashed #333;">
                                                    <p style="margin:0;font-size:14px;">📍 ${location}</p>
                                                    <p style="margin-top:5px;font-size:14px;">📅 ${event_date}</p>
                                                </td>
                                            </tr>

                                        </tbody>
                                    </table>

                                    <p style="margin-top:24px;color:#666;font-size:13px;">
                                        Merci de présenter ce billet à l’entrée de l’événement. Une pièce d’identité pourra également vous être demandée.
                                    </p>
                                    <p style="margin-top:24px;color:#666;font-size:13px;">
                                        — L’équipe eventribe
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align:center;padding:16px;height:30px;">
                                    <img src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${firstName}12345&scale=2&includetext" alt="Code-barres" />
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

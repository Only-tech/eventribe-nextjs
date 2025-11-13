import { EmailHeader } from "@/app/lib/email-templates/EmailHeader";
import { EmailFooter } from "@/app/lib/email-templates/EmailFooter";

export function UnregisterEmail(firstName: string, lastName: string, eventTitle: string): string {
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
                                        <h1 style="font-size:22px;font-weight:bold;margin-bottom:16px">Confirmation de désinscription</h1>
                                        <p>Bonjour ${firstName},</p>
                                        <p>Vous avez été désinscrit(e) de l’événement <strong>${eventTitle}</strong>.</p>
                                        <p>Cette action a peut-être été réalisée par vous-même ou par un administrateur.</p>
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

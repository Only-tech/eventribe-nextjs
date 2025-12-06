import { EmailHeader } from "@/app/lib/email-templates/EmailHeader";
import { EmailFooter } from "@/app/lib/email-templates/EmailFooter";

export function ContactEmail(name: string, email: string, message: string): string {
    // Manage the name cause the Header wait two arguments
    const names = name.split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || ""; 
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
                                        <h1 style="font-size:22px;font-weight:bold;margin-bottom:16px">Nouveau message</h1>
                                        <p style="margin:0 0 12px 0;"><a href="mailto:${email}" style="color:#1e2939;text-decoration:underline;">${email}</a></p>
                                        <p style="margin:0 0 12px 0;">${message.replace(/\n/g, '<br>')}</p>
                                        <p style="margin-top:24px;color:#666;font-size:13px;">
                                        — ${name}
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

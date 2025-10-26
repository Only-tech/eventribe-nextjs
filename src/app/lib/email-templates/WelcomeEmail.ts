import { EmailHeader } from "@/app/lib/email-templates/EmailHeader";
import { EmailFooter } from "@/app/lib/email-templates/EmailFooter";

export function WelcomeEmail(firstName: string, lastName: string): string {
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
                                        <h1 style="font-size:22px;font-weight:bold;margin-bottom:16px">Bienvenue sur eventribe</h1>
                                        <p style="margin:0 0 12px 0;">Bonjour ${firstName},</p>
                                        <p style="margin:0 0 12px 0;">Votre compte a bien été créé.</p>
                                        <p style="margin:0 0 12px 0;">Vous pouvez dès maintenant vous inscrire à des événements ou en organiser.</p>
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




// export function WelcomeEmail(firstName: string, lastName: string): string {
//     return `
//         <table width="100%" style="background-color:#fff;border:1px solid #E3E5DF;border-radius:8px;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif">
//             <tbody>
//                 <tr>
//                     <td >
//                         <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#E3E5DF;overflow:hidden;padding:12px;border-top-right-radius:8px;border-top-left-radius:8px;min-height:60px;">
//                             <tr>
//                                 <td align="left" style="padding:8px;">
//                                     <img src="https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/SplashPaintEventribeLogo.svg" 
//                                     alt="eventribe" width="150" height="25" style="display:block;" />
//                                 </td>


                               

//                                 <td align="right">
//                                     <table cellpadding="0" cellspacing="0" border="0">
//                                         <tr>
//                                             <td style="color:#000;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:18px;font-weight:medium; padding-right:8px;">
//                                                 ${firstName} ${lastName}
//                                             </td>
//                                             <td>
//                                                 <img src="https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/UserLogo.svg"
//                                                     alt="user" width="48" height="48" style="display:block;padding-right:8px;" />
//                                             </td>
//                                         </tr>
//                                     </table>
//                                 </td>


//                             </tr>
//                         </table>
//                     </td>
//                 </tr>
//                 <tr>
//                     <td align="center">
//                         <table width="580" style="margin:10px;text-align:left">
//                             <tbody>
//                                 <tr>
//                                     <td>
//                                         <h1 style="font-size:22px;font-weight:bold;margin-bottom:16px">
//                                             Bienvenue sur eventribe
//                                         </h1>
//                                         <p>Bonjour ${firstName},</p>
//                                         <p>Votre compte a bien été créé.</p>
//                                         <p>Vous pouvez dès maintenant vous inscrire à des événements ou en organiser.</p>
//                                         <p style="margin-top:24px;color:#666;font-size:13px">
//                                         — L’équipe eventribe
//                                         </p>
//                                     </td>
//                                 </tr>
//                                 <tr align="center">
//                                     <table width="580">
//                                         <tbody>
//                                             <tr align="center">
//                                                 <td style="font-size:12px;color:#666;padding:16px;border-top:1px solid #E3E5DF;">
//                                                     © ${new Date().getFullYear()} eventribe. Tous droits réservés.
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </td>
//                 </tr>
//             </tbody>
//         </table>
//     `;
// }

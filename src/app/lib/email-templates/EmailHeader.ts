export function EmailHeader(firstName: string, lastName: string): string {
    return `
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
                                        ${firstName} ${lastName}
                                    </td>
                                    <td>
                                        <img src="https://mbt32mmfp6mvexeg.public.blob.vercel-storage.com/UserLogo.svg"
                                            alt="avatar" width="32" height="32" 
                                            style="display:block;max-width:100%;height:auto;" />
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    `;
}

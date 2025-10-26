export function EmailFooter(): string {
    return `
        <tr>
            <td align="center">
                <table  width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;padding:0 10px;">
                    <tr align="center" style="font-size:12px;color:#666;">
                        <td style="padding:10px 0;border-top:1px solid #E3E5DF;">
                            Copyright © ${new Date().getFullYear()} eventribe. Tous droits réservés.               
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    `;
}

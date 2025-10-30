import { NextResponse } from "next/server";
import { sendNotificationEmail } from "@/app/lib/services/email";

export async function POST(req: Request) {
    try {
        const { subject, html } = await req.json();

        const to = process.env.TEST_EMAIL || "";

        await sendNotificationEmail(to, subject, html);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur API send-test-email:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

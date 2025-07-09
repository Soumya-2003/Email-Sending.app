import { NextRequest } from "next/server";
import { EmailService } from "src/lib/services/email.service";
import { EmailMessage } from "src/lib/types/email.types";



export async function POST(req: NextRequest){
    try {
        const email: EmailMessage = await req.json();
        const emailService = new EmailService();

        emailService.sendEmail(email);

        return new Response(JSON.stringify({ message: "Email sent successfully" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error('Error sending email:', error);
        return new Response(JSON.stringify({ error: "Failed to send email" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
        
    }
}
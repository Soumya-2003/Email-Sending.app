import { NextRequest } from 'next/server';
import { EmailService } from 'src/lib/services/email.service';

const emailService = new EmailService();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const emailId = searchParams.get('id');

  if (!emailId) {
    return new Response(JSON.stringify({ error: 'Missing email ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const attempts = emailService.getEmailAttempts(emailId);

  return new Response(JSON.stringify({ attempts }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
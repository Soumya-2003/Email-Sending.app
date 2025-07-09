export interface EmailMessage{
    id: string;
    to: string;
    from: string;
    subject: string;
    body: string;
}

export type EmailStatus = 'queued' | 'sending' | 'sent' | 'failed' | 'cancelled';

export interface EmailAttempt{
    provider: string;
    status: EmailStatus;
    error?: string;
    timestamp: Date;
    retryCount: number;
}
export interface EmailAttemptResponse {
  provider: string;
  status: 'queued' | 'sending' | 'sent' | 'failed' | 'cancelled';
  error?: string;
  timestamp: string;
  retryCount: number;
}
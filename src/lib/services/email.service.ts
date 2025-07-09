import { EmailProvider } from "../providers/email-provider.interface";
import { MockProvider1 } from "../providers/mock-provider1";
import { MockProvider2 } from "../providers/mock-provider2";
import { EmailAttempt, EmailMessage, EmailStatus } from "../types/email.types";
import { CircuitBreaker } from "../utils/circuit-breaker";
import { ExponentialBackoff } from "../utils/exponential-backoff";
import { IdempotencyHandler } from "../utils/idempotency-handler";
import { RateLimiter } from "../utils/rate-limiter";


export class EmailService {
  private providers: EmailProvider[];
  private currentProviderIndex = 0;
  private backoff = new ExponentialBackoff(1000, 8000, 5);
  private idempotencyHandler = new IdempotencyHandler();
  private rateLimiter = new RateLimiter(60); // 60 emails per minute
  private attempts = new Map<string, EmailAttempt[]>();
  private queue: EmailMessage[] = [];
  private processingQueue = false;
  private circuitBreakers = new Map<string, CircuitBreaker>();

  constructor(
    private defaultMaxRetries = 3,
    private enableRateLimiting = true,
    private enableCircuitBreaker = true
  ) {
    this.providers = [new MockProvider1(), new MockProvider2()];

    // Initialize circuit breakers for each provider
    this.providers.forEach(provider => {
      this.circuitBreakers.set(provider.getName(), new CircuitBreaker());
    });
  }

  sendEmail(email: EmailMessage): void {
    if (this.idempotencyHandler.isDuplicate(email)) {
      console.warn(`Skipping duplicate email with ID ${email.id}`);
      return;
    }

    this.queue.push(email);

    if (!this.processingQueue) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.processingQueue = true;

    while (this.queue.length > 0) {
      const email = this.queue.shift()!;

      await this.sendWithRetry(email);
    }

    this.processingQueue = false;
  }

  private async sendWithRetry(email: EmailMessage): Promise<void> {
    let retryCount = 0;
    let lastError: unknown = null;

    while (retryCount <= this.defaultMaxRetries) {
      try {
        // Apply rate limiting
        if (this.enableRateLimiting) {
          await this.rateLimiter.waitForAvailableSlot();
        }

        const provider = this.providers[this.currentProviderIndex];

        this.recordAttempt(email.id, provider.getName(), 'sending', retryCount);

        const circuitBreaker = this.circuitBreakers.get(provider.getName());

        if (circuitBreaker && this.enableCircuitBreaker) {
          await circuitBreaker.run(async () => {
            await provider.sendEmail(email);
          });
        } else {
          await provider.sendEmail(email);
        }

        // Success
        this.recordAttempt(email.id, provider.getName(), 'sent', retryCount);
        return;
      } catch (error) {
        lastError = error;
        this.recordAttempt(
          email.id,
          this.providers[this.currentProviderIndex].getName(),
          'failed',
          retryCount,
          error instanceof Error ? error.message : String(error)
        );

        retryCount++;

        // Try fallback
        if (await this.shouldFallbackToNextProvider()) {
          this.switchToNextProvider();
          console.log(`Switched to provider: ${this.getCurrentProviderName()}`);
          continue; // skip delay and try again immediately
        }

        // Apply exponential backoff before next retry
        if (retryCount <= this.defaultMaxRetries) {
          const delay = this.backoff.getDelay(retryCount);
          console.log(
            `Email ${email.id} failed. Retrying in ${delay}ms (attempt ${retryCount}/${this.defaultMaxRetries})...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    console.error(
      `Failed to send email with ID ${email.id} after ${this.defaultMaxRetries} retries. Last error: ${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`
    );
  }

  private async shouldFallbackToNextProvider(): Promise<boolean> {
    const provider = this.providers[this.currentProviderIndex];
    const circuitBreaker = this.circuitBreakers.get(provider.getName());

    if (!circuitBreaker) return false;

    // Fallback only if the circuit is open (i.e., too many failures recently)
    return circuitBreaker['state'] === 'open';
  }

  private switchToNextProvider(): void {
    this.currentProviderIndex = (this.currentProviderIndex + 1) % this.providers.length;
  }

  private getCurrentProviderName(): string {
    return this.providers[this.currentProviderIndex].getName();
  }

  private recordAttempt(
    emailId: string,
    provider: string,
    status: EmailStatus,
    retryCount: number,
    error?: string
  ): void {
    const attempt: EmailAttempt = {
      provider,
      status,
      error,
      timestamp: new Date(),
      retryCount,
    };

    if (!this.attempts.has(emailId)) {
      this.attempts.set(emailId, []);
    }

    this.attempts.get(emailId)?.push(attempt);

    console.log(`Email ${emailId}: ${status} via ${provider}${error ? ` - ${error}` : ''}`);
  }

  getEmailAttempts(emailId: string): EmailAttempt[] | undefined {
    return this.attempts.get(emailId);
  }

  getTotalAttempts(emailId: string): number {
    const attempts = this.attempts.get(emailId);
    return attempts ? attempts.length : 0;
  }

  getLastAttempt(emailId: string): EmailAttempt | undefined {
    const attempts = this.attempts.get(emailId);
    return attempts ? attempts[attempts.length - 1] : undefined;
  }

  clearHistory(emailId: string): void {
    this.attempts.delete(emailId);
  }

  clearAllHistory(): void {
    this.attempts.clear();
  }
}
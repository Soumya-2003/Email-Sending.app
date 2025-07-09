export class ExponentialBackoff{
    private baseDelay: number;
    private maxDelay: number;
    private maxRetries: number;

    constructor(baseDelay: number = 1000, maxDelay: number = 8000, maxRetries: number = 5) {
        this.baseDelay = baseDelay;
        this.maxDelay = maxDelay;
        this.maxRetries = maxRetries;
    }

    getDelay(retryCount: number): number {
        if (retryCount >= this.maxRetries) {
            throw new Error("Max retries exceeded");
        }
        const delay = Math.min(this.baseDelay * Math.pow(2, retryCount), this.maxDelay);
        return Math.floor(Math.random() * delay);
    }
}
export class RateLimiter{
    private requestsPerMinute: number;
    private timestamps: number[] = [];

    constructor(requestsPerMinute: number) {
        this.requestsPerMinute = requestsPerMinute;
    }

    async waitForAvailableSlot(): Promise<void>{
        const now = Date.now();
        const oneMinuteAgo = now - 60 * 1000;
        
        this.timestamps = this.timestamps.filter(timestamp => timestamp > oneMinuteAgo);

        if(this.timestamps.length >= this.requestsPerMinute){
            const waitUntil = this.timestamps[0] + (60 * 1000);
            const waitTime = waitUntil - now;

            await new Promise(resolve => setTimeout(resolve, waitTime));
            this.timestamps = this.timestamps.slice(1);
        }
        this.timestamps.push(now);
    }
}
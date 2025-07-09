
interface CircuitBreakerOptions{
    maxFailures: number;
    resetTimeout: number;
    halfOpenAttempts: number;
}

type CircuitState = 'closed' | 'open' | 'half-open';

export class CircuitBreaker {
    private state: CircuitState = 'closed';
    private failureCount= 0;
    private lastFailureTime: Date | null = null;
    private pendingRequests: Array<() => void> = [];

    constructor(
        private options: CircuitBreakerOptions = {
            maxFailures: 5,
            resetTimeout: 60000, 
            halfOpenAttempts: 3
        }
    ){}

    run<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.canExecute()) {
        this.pendingRequests.push(() => {
          this.execute(fn, resolve, reject);
        });
        
        return;
      }
      
      this.execute(fn, resolve, reject);
    });
  }

  private canExecute(): boolean {
    if (this.state === 'closed') {
      return true;
    }
    
    if (this.state === 'open') {
      const now = new Date();
      if (this.lastFailureTime && 
          now.getTime() - this.lastFailureTime.getTime() > this.options.resetTimeout) {
        // Time to attempt recovery
        this.state = 'half-open';
        return true;
      }
      return false;
    }

    if (this.failureCount >= this.options.halfOpenAttempts) {
      this.state = 'open';
      this.lastFailureTime = new Date();
      return false;
    }
    
    return true;
}

private execute<T>(fn: () => Promise<T>, resolve: (value: T) => void, reject: (reason?: unknown) => void): void {
    fn()
      .then(result => {
        if (this.state === 'half-open') {
          this.failureCount = 0;
          this.state = 'closed';
          
          
          this.processPendingRequests();
        }
        
        resolve(result);
      })
      .catch(error => {
        this.failureCount++;
        this.lastFailureTime = new Date();
        
        if (this.failureCount >= this.options.maxFailures) {
          this.state = 'open';
        }
        
        reject(error);
      });
      }
  
  private processPendingRequests(): void {
    const requestsToProcess = [...this.pendingRequests];
    this.pendingRequests = [];
    
    requestsToProcess.forEach(requestFn => requestFn());
  }
}


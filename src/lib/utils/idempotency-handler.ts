import { EmailMessage } from "../types/email.types";


export class IdempotencyHandler{
    private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000;
    private sentEmails = new Map<string, Date>();

    isDuplicate(email: EmailMessage): boolean{
        const now = new Date();

        if(this.sentEmails.has(email.id)){
            const timestamp = this.sentEmails.get(email.id)!;
            if(now.getTime() - timestamp.getTime() < IdempotencyHandler.CACHE_DURATION){
                return true; 
            }
            else{
                this.sentEmails.delete(email.id);
            }
        }
        this.sentEmails.set(email.id, now);
        return false;
    }
}
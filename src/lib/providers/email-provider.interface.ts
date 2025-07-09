import { EmailMessage } from "../types/email.types";


export interface EmailProvider{
    sendEmail(email: EmailMessage): Promise<void>;
    getName(): string;
}
import { EmailMessage } from "../types/email.types";
import { EmailProvider } from "./email-provider.interface";


export class MockProvider2 implements EmailProvider{
    private name = 'MockProvider2';

    async sendEmail(email: EmailMessage): Promise<void> {
        console.log(`${email.from} send an email to ${email.to} with subject "${email.subject}"`);

        if(Math.random() < 0.2){
            throw new Error(`${email.from} Failed to send email`);
        }

        await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
        console.log(`${email.from} successfully sent email to ${email.to}`);
  
    }
    getName(): string{
        return this.name;
    }
}
## 📨 Resilient Email Sending Service
A robust and scalable email sending service built with Next.js , TypeScript , and Tailwind CSS , featuring retry logic, fallback providers, idempotency, 
rate limiting, status tracking, and more.

### 🧩 Features
✅ Retry Mechanism : Exponential backoff retry strategy

✅ Provider Fallback : Switches to backup provider on failure

✅ Idempotency : Prevents duplicate email sends using unique IDs

✅ Rate Limiting : Limits number of emails per minute

✅ Status Tracking : Logs every attempt (queued, sent, failed)

✅ Circuit Breaker : Prevents cascading failures during outages

✅ Queue System : Ensures asynchronous and orderly delivery

✅ Modern UI : Clean, responsive interface with toast notifications

✅ Real-time Status Updates : Polling-based attempt logs

### 🚀 Getting Started
1. Clone the project

  `git clone https://github.com/Soumya-2003/Email-Sending.app.git`

  `cd email-service`

3. Install dependencies
   
    `npm install`

5. Start the development server
   
     `npm run dev`

Open http://localhost:3000 in your browser to view the app.

Use the following command to build: `npm run build`

Then start the production server: `npm start`

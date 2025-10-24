# PaperSense: AI-Powered Paper Evaluation Platform
PaperSense is a visually stunning, AI-driven platform designed to revolutionize academic evaluation for both students and teachers. The application provides a seamless workflow for uploading handwritten or typed answer sheets, performing client-side Optical Character Recognition (OCR), and leveraging a powerful AI agent for objective evaluation.
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Sanjeev-imxal/papersense-ai-powered-paper-evaluation-platform)
## Key Features
-   **Role-Based Access Control:** Separate, tailored experiences for Students and Teachers.
-   **Seamless Document Upload:** An intuitive drag-and-drop interface for uploading scanned PDFs or images of answer sheets.
-   **Client-Side OCR:** In-browser Optical Character Recognition using Tesseract.js to extract text from submissions.
-   **AI-Powered Evaluation:** Utilizes a stateful `EvaluationAgent` (built with Cloudflare Durable Objects) to manage the evaluation lifecycle, from OCR text processing to generating marks and feedback via Cloudflare's AI Gateway.
-   **Teacher Dashboard:** A comprehensive overview of batch results, student submissions, and interactive charts for class performance analytics.
-   **Student Dashboard:** Personalized view of scores, detailed feedback summaries, and AI-generated tips for improvement.
-   **Detailed Evaluation View:** A side-by-side comparison of the student's answer and the model answer, along with a full breakdown of the AI's evaluation.
-   **PDF Report Generation:** Export detailed evaluation reports as downloadable PDFs.
> **Important Note:** This project utilizes AI capabilities with a shared resource pool. There is a limit on the number of requests that can be made to the AI servers across all user apps in a given time period.
## Technology Stack
-   **Frontend:**
    -   React (Vite)
    -   Tailwind CSS
    -   shadcn/ui
    -   Recharts for charts
    -   Zustand for state management
    -   Framer Motion for animations
    -   Tesseract.js for client-side OCR
    -   jsPDF & html2canvas for PDF generation
-   **Backend:**
    -   Cloudflare Workers
    -   Hono
    -   Cloudflare Agents (Durable Objects) for stateful, persistent agents
-   **AI & Services:**
    -   Cloudflare AI Gateway
## Getting Started
Follow these instructions to get a local copy up and running for development and testing purposes.
### Prerequisites
-   [Bun](https://bun.sh/) installed on your machine.
-   A [Cloudflare account](https://dash.cloudflare.com/sign-up).
### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/papersense.git
    cd papersense
    ```
2.  **Install dependencies:**
    ```bash
    bun install
    ```
3.  **Configure Environment Variables:**
    Create a `.dev.vars` file in the root of the project for local development. You will need to get your Account ID and create an AI Gateway from the Cloudflare dashboard.
    ```ini
    # .dev.vars
    # Required: Cloudflare AI Gateway URL
    # Format: https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY_ID/openai
    CF_AI_BASE_URL="your-cloudflare-ai-gateway-url"
    # Required: Cloudflare API Key for the AI Gateway
    CF_AI_API_KEY="your-cloudflare-api-key"
    ```
## Development
To start the local development server, which includes both the Vite frontend and the Cloudflare Worker backend, run:
```bash
bun run dev
```
This will start the application, typically on `http://localhost:3000`. The frontend will auto-update as you edit the files.
## Deployment
This project is designed for seamless deployment to Cloudflare Pages.
1.  **Login to Wrangler:**
    If you haven't already, authenticate with your Cloudflare account.
    ```bash
    bunx wrangler login
    ```
2.  **Deploy the application:**
    Run the deploy script. This will build the application and deploy it to your Cloudflare account.
    ```bash
    bun run deploy
    ```
3.  **Configure Production Secrets:**
    After the first deployment, you must add your production environment variables to the deployed Worker through the Cloudflare dashboard.
    -   Navigate to your Pages project > Settings > Functions.
    -   Under "Durable Object Bindings", ensure `APP_CONTROLLER` and `EVALUATION_AGENT` are correctly bound.
    -   Under "Environment Variables", add the `CF_AI_BASE_URL` and `CF_AI_API_KEY` secrets.
Alternatively, you can deploy directly from your GitHub repository using the button below.
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Sanjeev-imxal/papersense-ai-powered-paper-evaluation-platform)
## Project Structure
-   `src/`: Contains all the frontend React application code, including pages, components, hooks, and utility functions.
-   `worker/`: Contains all the backend Cloudflare Worker and Durable Object code, including API routes, agent logic, and AI integration.
-   `public/`: Static assets for the frontend.
-   `wrangler.jsonc`: Configuration file for the Cloudflare Worker, including bindings and build settings.
## License
This project is licensed under the MIT License. See the `LICENSE` file for details.
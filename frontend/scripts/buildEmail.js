import { render } from "@react-email/render";
import VerificationEmail from "../emails/VerificationEmail.tsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildEmail() {
  console.log("Building email template...");
  
  // Render the email to a static HTML string
  const html = await render(VerificationEmail());
  
  // Ensure the backend templates directory exists
  const backendTemplatesDir = path.resolve(__dirname, "../../backend/templates");
  if (!fs.existsSync(backendTemplatesDir)) {
    fs.mkdirSync(backendTemplatesDir, { recursive: true });
  }
  
  // Write the HTML to the backend folder
  const outputPath = path.join(backendTemplatesDir, "otp_email.html");
  fs.writeFileSync(outputPath, html, "utf-8");
  
  console.log(`Email template built and saved to ${outputPath}`);
}

buildEmail().catch(console.error);

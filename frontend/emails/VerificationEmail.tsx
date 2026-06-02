import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

const main = {
  backgroundColor: "#020202",
  fontFamily:
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif",
  padding: "40px 0",
};

const container = {
  margin: "0 auto",
  padding: "0",
  width: "520px",
  backgroundColor: "#0a0a0a",
  border: "1px solid #222222",
  borderRadius: "12px",
  boxShadow: "0 4px 20px -2px rgba(0,0,0,0.8)",
  overflow: "hidden",
};

const header = {
  padding: "32px 40px 24px",
  borderBottom: "1px solid #1a1a1a",
  textAlign: "left" as const,
};

const logoContainer = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const logoText = {
  fontSize: "22px",
  fontWeight: "900",
  color: "#ffffff",
  letterSpacing: "-0.5px",
  margin: "0",
};

const subtitle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#555555",
  letterSpacing: "3px",
  textTransform: "uppercase" as const,
  marginTop: "6px",
  fontFamily: "monospace",
};

const content = {
  padding: "32px 40px",
};

const greeting = {
  margin: "0 0 8px",
  fontSize: "14px",
  color: "#888888",
};

const message = {
  margin: "0 0 28px",
  fontSize: "15px",
  color: "#cccccc",
  lineHeight: "1.6",
};

const otpContainer = {
  margin: "0 0 28px",
  textAlign: "center" as const,
};

const otpDigit = {
  display: "inline-block",
  width: "44px",
  height: "56px",
  lineHeight: "56px",
  textAlign: "center" as const,
  fontSize: "32px",
  fontWeight: "900",
  fontFamily: "monospace",
  backgroundColor: "#000000",
  color: "#ffffff",
  border: "1px solid #333333",
  borderRadius: "8px",
  margin: "0 4px",
  boxShadow: "inset 0 4px 30px rgba(0,0,0,1)",
};

const warning = {
  margin: "0 0 24px",
  fontSize: "12px",
  color: "#555555",
  lineHeight: "1.6",
};

const footerContainer = {
  borderTop: "1px solid #1a1a1a",
  paddingTop: "20px",
};

const footer = {
  margin: "0",
  fontSize: "11px",
  color: "#444444",
};

const link = {
  color: "#666666",
  textDecoration: "none",
};

export default function VerificationEmail() {
  // Use Python string formatting placeholders that will be replaced by the backend
  const otpPlaceholder = "{otp}";
  const namePlaceholder = "{name}";
  const purposePlaceholder = "{purpose}";
  
  // We mock a 6-digit OTP for the preview, but at runtime it will be replaced
  // To handle the iteration cleanly in React while emitting the raw placeholder,
  // we'll just output the digits. Since we want styling on EACH digit, 
  // it's tricky to inject `{otp}` directly into 6 boxes if the backend replaces a single `{otp}` string.
  // Actually, wait, the current Python code does:
  // digit_boxes = "".join(f'<span>{d}</span>' for d in digits)
  // If we want the React template to have 6 boxes, we can't easily iterate over "{otp}" in React.
  // Instead, let's change the Python backend to pass `{digit_0}`, `{digit_1}`, etc., or we just pass the full HTML for the boxes, OR we design it as a single box with letter-spacing.
  // A single box with letter-spacing is easier and works in all email clients!
  
  return (
    <Html>
      <Head />
      <Preview>Your Aethel ATS verification code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://aethel.ai/assets/shield_logo.png"
              width="32"
              height="32"
              alt="Aethel ATS"
              style={{ display: "inline-block", verticalAlign: "middle", marginRight: "12px" }}
            />
            <Text style={{ ...logoText, display: "inline-block", verticalAlign: "middle" }}>
              Aethel ATS
            </Text>
            <Text style={subtitle}>Precision Recruitment</Text>
          </Section>
          
          <Section style={content}>
            <Text style={greeting}>Hi {namePlaceholder},</Text>
            <Text style={message}>
              Here's your code to {purposePlaceholder}. It expires in <strong style={{ color: "#ffffff" }}>10 minutes</strong>.
            </Text>
            
            <Section style={otpContainer}>
              {/* Using a single block with letter-spacing to render the {otp} string gracefully */}
              <div style={{
                display: "inline-block",
                padding: "16px 32px",
                backgroundColor: "#000000",
                border: "1px solid #333333",
                borderRadius: "12px",
                color: "#ffffff",
                fontSize: "36px",
                fontWeight: "900",
                fontFamily: "monospace",
                letterSpacing: "12px",
                boxShadow: "inset 0 4px 30px rgba(0,0,0,1)",
              }}>
                {otpPlaceholder}
              </div>
            </Section>
            
            <Text style={warning}>
              If you didn't request this, you can safely ignore this email. Someone may have entered your email address by mistake.
            </Text>
            
            <Section style={footerContainer}>
              <Text style={footer}>
                This is a transactional email from Aethel ATS.<br />
                Questions? Contact us at{" "}
                <a href="mailto:support@aethel.ai" style={link}>
                  support@aethel.ai
                </a>
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

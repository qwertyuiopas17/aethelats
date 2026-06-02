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
  Font,
} from "@react-email/components";
import * as React from "react";

// The website uses a dark background with subtle cyan/purple radial gradients.
// We can use a linear gradient in email for better compatibility, simulating the glow.
const main = {
  backgroundColor: "#000000",
  backgroundImage: "radial-gradient(circle at top right, rgba(0, 240, 255, 0.1) 0%, transparent 60%), radial-gradient(circle at bottom left, rgba(176, 38, 255, 0.1) 0%, transparent 60%)",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
  padding: "60px 0",
};

// Premium glass-like bento box
const container = {
  margin: "0 auto",
  padding: "0",
  width: "520px",
  backgroundColor: "rgba(10, 10, 10, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "16px",
  boxShadow: "0 20px 40px -10px rgba(0,0,0,0.8), inset 0 1px 1px 0 rgba(255,255,255,0.05)",
  overflow: "hidden",
};

const header = {
  padding: "40px 40px 32px",
  textAlign: "center" as const,
};

const logoImage = {
  margin: "0 auto",
  display: "block",
  borderRadius: "12px",
  boxShadow: "0 0 20px rgba(255,255,255,0.1)",
};

const logoText = {
  fontSize: "24px",
  fontWeight: "800",
  color: "#ffffff",
  letterSpacing: "-0.5px",
  margin: "24px 0 0",
  textAlign: "center" as const,
};

const subtitle = {
  fontSize: "11px",
  fontWeight: "600",
  color: "rgba(255,255,255,0.5)",
  letterSpacing: "4px",
  textTransform: "uppercase" as const,
  margin: "8px 0 0",
  textAlign: "center" as const,
};

const content = {
  padding: "0 40px 40px",
};

const greeting = {
  margin: "0 0 16px",
  fontSize: "16px",
  fontWeight: "500",
  color: "#ffffff",
};

const message = {
  margin: "0 0 32px",
  fontSize: "15px",
  color: "rgba(255,255,255,0.7)",
  lineHeight: "1.6",
};

const otpContainer = {
  margin: "0 0 32px",
  textAlign: "center" as const,
};

// Sleek 3D glowing OTP boxes
const otpDigit = {
  display: "inline-block",
  width: "48px",
  height: "64px",
  lineHeight: "64px",
  textAlign: "center" as const,
  fontSize: "28px",
  fontWeight: "700",
  backgroundColor: "rgba(255,255,255,0.03)",
  color: "#ffffff",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "12px",
  margin: "0 6px",
  boxShadow: "inset 0 2px 4px rgba(255,255,255,0.05)",
};

const warning = {
  margin: "0 0 32px",
  fontSize: "13px",
  color: "rgba(255,255,255,0.4)",
  lineHeight: "1.6",
  textAlign: "center" as const,
};

const hr = {
  borderColor: "rgba(255,255,255,0.05)",
  margin: "0 0 24px",
};

const footer = {
  margin: "0",
  fontSize: "12px",
  color: "rgba(255,255,255,0.3)",
  textAlign: "center" as const,
  lineHeight: "1.5",
};

const link = {
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: "500",
};

export default function VerificationEmail() {
  const namePlaceholder = "{name}";
  const purposePlaceholder = "{purpose}";
  
  // Array of 6 placeholders for individual digits
  const digitPlaceholders = ["{d0}", "{d1}", "{d2}", "{d3}", "{d4}", "{d5}"];

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="sans-serif"
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Your Aethel ATS verification code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://huggingface.co/spaces/Unded-17/aethel-backend-v3/resolve/main/shield_logo.png"
              width="56"
              height="56"
              alt="Aethel ATS Logo"
              style={logoImage}
            />
            <Text style={logoText}>
              Aethel ATS
            </Text>
            <Text style={subtitle}>Precision Recruitment</Text>
          </Section>
          
          <Section style={content}>
            <Text style={greeting}>Hi {namePlaceholder},</Text>
            <Text style={message}>
              Here is the security code to {purposePlaceholder}. This code will securely expire in <strong>10 minutes</strong>.
            </Text>
            
            <Section style={otpContainer}>
              {digitPlaceholders.map((digit, i) => (
                <span key={i} style={otpDigit}>
                  {digit}
                </span>
              ))}
            </Section>
            
            <Text style={warning}>
              If you didn't request this code, you can safely ignore this email.
            </Text>
            
            <Hr style={hr} />
            
            <Text style={footer}>
              Secure transactional email from <strong>Aethel ATS</strong>.<br />
              Questions? Contact us at{" "}
              <a href="mailto:support@aethel.ai" style={link}>
                support@aethel.ai
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

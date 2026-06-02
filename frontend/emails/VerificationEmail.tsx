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

// Premium dark background with email-safe styling
// Radial gradients don't work in many email clients, so we use a solid dark bg with subtle accents via borders
const main = {
  backgroundColor: "#0a0a0a",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
  padding: "60px 20px",
};

// Premium glass-like container with cyan accent border
const container = {
  margin: "0 auto",
  padding: "0",
  width: "520px",
  maxWidth: "100%",
  backgroundColor: "rgba(15, 15, 15, 0.98)",
  border: "1px solid rgba(0, 240, 255, 0.15)",
  borderRadius: "20px",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.02) inset",
  overflow: "hidden",
};

const header = {
  padding: "48px 40px 40px",
  textAlign: "center" as const,
  background: "linear-gradient(to bottom, rgba(0, 240, 255, 0.03) 0%, transparent 100%)",
  borderBottom: "1px solid rgba(0, 240, 255, 0.08)",
};

const logoImage = {
  margin: "0 auto",
  display: "block",
  borderRadius: "16px",
  backgroundColor: "rgba(0, 240, 255, 0.05)",
  padding: "8px",
  border: "1px solid rgba(0, 240, 255, 0.2)",
  boxShadow: "0 0 20px rgba(0, 240, 255, 0.15), 0 4px 12px rgba(0,0,0,0.5)",
};

const logoText = {
  fontSize: "26px",
  fontWeight: "800",
  color: "#ffffff",
  letterSpacing: "-0.5px",
  margin: "24px 0 0",
  textAlign: "center" as const,
  textShadow: "0 2px 10px rgba(0, 240, 255, 0.2)",
};

const subtitle = {
  fontSize: "10px",
  fontWeight: "700",
  color: "rgba(0, 240, 255, 0.6)",
  letterSpacing: "4px",
  textTransform: "uppercase" as const,
  margin: "8px 0 0",
  textAlign: "center" as const,
};

const content = {
  padding: "40px 40px 48px",
};

const greeting = {
  margin: "0 0 16px",
  fontSize: "17px",
  fontWeight: "600",
  color: "#ffffff",
};

const message = {
  margin: "0 0 36px",
  fontSize: "15px",
  color: "rgba(255,255,255,0.75)",
  lineHeight: "1.7",
};

const otpContainer = {
  margin: "0 0 40px",
  textAlign: "center" as const,
  padding: "24px 0",
  background: "linear-gradient(to bottom, rgba(0, 240, 255, 0.02) 0%, transparent 100%)",
  borderRadius: "16px",
};

const otpLabel = {
  margin: "0 0 16px",
  fontSize: "11px",
  fontWeight: "700",
  color: "rgba(0, 240, 255, 0.7)",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
};

// Premium 3D glowing OTP boxes with cyan accent
const otpDigit = {
  display: "inline-block",
  width: "52px",
  height: "68px",
  lineHeight: "68px",
  textAlign: "center" as const,
  fontSize: "32px",
  fontWeight: "800",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  color: "#ffffff",
  border: "1px solid rgba(0, 240, 255, 0.25)",
  borderRadius: "14px",
  margin: "0 5px",
  boxShadow: "0 0 20px rgba(0, 240, 255, 0.15), inset 0 1px 2px rgba(255,255,255,0.05), 0 4px 12px rgba(0,0,0,0.4)",
  textShadow: "0 2px 8px rgba(0, 240, 255, 0.3)",
};

const warning = {
  margin: "0 0 36px",
  fontSize: "13px",
  color: "rgba(255,255,255,0.5)",
  lineHeight: "1.7",
  textAlign: "center" as const,
  padding: "16px 20px",
  backgroundColor: "rgba(255, 255, 255, 0.02)",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.05)",
};

const hr = {
  borderColor: "rgba(0, 240, 255, 0.1)",
  margin: "0 0 28px",
};

const footer = {
  margin: "0",
  fontSize: "12px",
  color: "rgba(255,255,255,0.4)",
  textAlign: "center" as const,
  lineHeight: "1.6",
};

const link = {
  color: "rgba(0, 240, 255, 0.9)",
  textDecoration: "none",
  fontWeight: "600",
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
              <Text style={otpLabel}>Your Verification Code</Text>
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

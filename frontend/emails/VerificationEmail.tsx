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

// Pure black background with geometric pattern
const main = {
  backgroundColor: "#000000",
  backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  padding: "40px 20px",
};

// Dark container - pure monochrome
const container = {
  margin: "0 auto",
  padding: "0",
  maxWidth: "560px",
  backgroundColor: "#0a0a0a",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "16px",
  boxShadow: "0 20px 40px -10px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
  overflow: "hidden",
};

// Simple header - monochrome
const header = {
  padding: "40px 32px 32px",
  textAlign: "center" as const,
  borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
};

const logoImage = {
  display: "block",
  margin: "0 auto 24px",
  width: "48px",
  height: "48px",
};

const brandName = {
  fontSize: "24px",
  fontWeight: "900",
  color: "#ffffff",
  letterSpacing: "-0.5px",
  margin: "0 0 6px",
};

const brandTagline = {
  fontSize: "10px",
  fontWeight: "700",
  color: "rgba(255, 255, 255, 0.35)",
  letterSpacing: "3px",
  textTransform: "uppercase" as const,
  margin: "0",
};

// Content
const content = {
  padding: "32px",
};

const greeting = {
  fontSize: "16px",
  fontWeight: "600",
  color: "rgba(255, 255, 255, 0.95)",
  margin: "0 0 12px",
};

const message = {
  fontSize: "14px",
  color: "rgba(255, 255, 255, 0.65)",
  lineHeight: "1.6",
  margin: "0 0 32px",
};

// OTP Section - pure monochrome with brighter accents
const otpSection = {
  padding: "32px 24px",
  margin: "0 0 32px",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  borderRadius: "12px",
  textAlign: "center" as const,
  border: "1px solid rgba(255, 255, 255, 0.08)",
};

const otpLabel = {
  fontSize: "10px",
  fontWeight: "700",
  color: "rgba(255, 255, 255, 0.6)",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  margin: "0 0 20px",
};

const otpDigit = {
  display: "inline-block",
  width: "48px",
  height: "56px",
  lineHeight: "56px",
  textAlign: "center" as const,
  fontSize: "28px",
  fontWeight: "900",
  color: "#ffffff",
  backgroundColor: "#000000",
  border: "1px solid rgba(255, 255, 255, 0.25)",
  borderRadius: "10px",
  margin: "0 4px 8px",
  boxShadow: "0 0 20px rgba(255, 255, 255, 0.08), 0 4px 12px rgba(0,0,0,0.8)",
};

const expiryNote = {
  fontSize: "12px",
  color: "rgba(255, 255, 255, 0.4)",
  margin: "16px 0 0",
};

const warningText = {
  fontSize: "12px",
  color: "rgba(255, 255, 255, 0.4)",
  lineHeight: "1.6",
  textAlign: "center" as const,
  margin: "0 0 32px",
  padding: "16px",
  backgroundColor: "rgba(255, 255, 255, 0.02)",
  borderRadius: "8px",
};

const divider = {
  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
  margin: "0 0 24px",
};

const footer = {
  fontSize: "12px",
  color: "rgba(255, 255, 255, 0.35)",
  lineHeight: "1.6",
  textAlign: "center" as const,
  margin: "0",
};

const link = {
  color: "#ffffff",
  textDecoration: "underline",
};

export default function VerificationEmail() {
  const namePlaceholder = "{name}";
  const purposePlaceholder = "{purpose}";
  
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
              width="48"
              height="48"
              alt="Aethel ATS"
              style={logoImage}
            />
            <Heading style={brandName}>Aethel ATS</Heading>
            <Text style={brandTagline}>Precision Recruitment</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {namePlaceholder},</Text>
            <Text style={message}>
              Here is your secure verification code to {purposePlaceholder}.
            </Text>

            <div style={otpSection}>
              <Text style={otpLabel}>Verification Code</Text>
              <div>
                {digitPlaceholders.map((digit, i) => (
                  <span key={i} style={otpDigit}>{digit}</span>
                ))}
              </div>
              <Text style={expiryNote}>
                Expires in <strong style={{color: "#fff"}}>10 minutes</strong>
              </Text>
            </div>

            <Text style={warningText}>
              If you didn't request this code, you can safely ignore this email.
            </Text>

            <Hr style={divider} />

            <Text style={footer}>
              Secure email from <strong>Aethel ATS</strong><br />
              Questions? <a href="mailto:support@aethel.ai" style={link}>support@aethel.ai</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

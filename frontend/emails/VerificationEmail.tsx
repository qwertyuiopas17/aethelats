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

// Pure monochrome aesthetic - white on black, no colors
// Inspired by the neural network wireframe and premium glass-morphism
const main = {
  backgroundColor: "#000000",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif",
  padding: "60px 20px",
};

// Premium glass container - pure white borders, subtle glow
const container = {
  margin: "0 auto",
  padding: "0",
  width: "520px",
  maxWidth: "100%",
  backgroundColor: "rgba(10, 10, 10, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "20px",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.9), inset 0 1px 1px 0 rgba(255,255,255,0.05)",
  overflow: "hidden",
};

const header = {
  padding: "48px 40px 40px",
  textAlign: "center" as const,
  background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 0%, transparent 100%)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
};

const logoImage = {
  margin: "0 auto",
  display: "block",
  borderRadius: "16px",
  backgroundColor: "rgba(255, 255, 255, 0.04)",
  padding: "12px",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  boxShadow: "0 0 30px rgba(255, 255, 255, 0.08), 0 4px 12px rgba(0,0,0,0.5)",
};

const logoText = {
  fontSize: "28px",
  fontWeight: "900",
  color: "#ffffff",
  letterSpacing: "-0.8px",
  margin: "24px 0 0",
  textAlign: "center" as const,
  textShadow: "0 2px 12px rgba(255, 255, 255, 0.15)",
};

const subtitle = {
  fontSize: "9px",
  fontWeight: "800",
  color: "rgba(255, 255, 255, 0.4)",
  letterSpacing: "5px",
  textTransform: "uppercase" as const,
  margin: "10px 0 0",
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
  padding: "32px 0",
  background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 0%, transparent 100%)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.03)",
};

const otpLabel = {
  margin: "0 0 20px",
  fontSize: "10px",
  fontWeight: "800",
  color: "rgba(255, 255, 255, 0.5)",
  letterSpacing: "3px",
  textTransform: "uppercase" as const,
};

// Premium monochrome OTP boxes - pure white glow, inspired by neural nodes
const otpDigit = {
  display: "inline-block",
  width: "56px",
  height: "72px",
  lineHeight: "72px",
  textAlign: "center" as const,
  fontSize: "36px",
  fontWeight: "900",
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  color: "#ffffff",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "14px",
  margin: "0 4px",
  boxShadow: "0 0 25px rgba(255, 255, 255, 0.1), inset 0 1px 2px rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.5)",
  textShadow: "0 2px 12px rgba(255, 255, 255, 0.3)",
  letterSpacing: "0px",
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
  borderColor: "rgba(255, 255, 255, 0.08)",
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
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: "700",
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

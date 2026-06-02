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

// Dark teal/green background matching your site
const main = {
  backgroundColor: "#0a0f0f",
  backgroundImage: "radial-gradient(ellipse at top, rgba(10, 30, 30, 0.8) 0%, rgba(5, 15, 15, 1) 50%)",
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  padding: "40px 0",
};

// Premium container with depth
const container = {
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  backgroundColor: "rgba(15, 20, 20, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "24px",
  boxShadow: "0 30px 60px -15px rgba(0,0,0,0.9), inset 0 1px 2px 0 rgba(255,255,255,0.04)",
  overflow: "hidden",
};

// Decorative top bar
const topBar = {
  height: "4px",
  background: "linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.15) 100%)",
};

// Hero section with logo
const hero = {
  padding: "56px 48px 40px",
  textAlign: "center" as const,
  background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 0%, transparent 100%)",
};

const logoWrapper = {
  margin: "0 auto 28px",
  width: "72px",
  height: "72px",
  display: "inline-block",
  padding: "16px",
  backgroundColor: "rgba(255, 255, 255, 0.03)",
  borderRadius: "20px",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 0 40px rgba(255, 255, 255, 0.06), 0 8px 24px rgba(0,0,0,0.4)",
};

const logoImage = {
  width: "40px",
  height: "40px",
  display: "block",
};

const brandName = {
  fontSize: "32px",
  fontWeight: "900",
  color: "#ffffff",
  letterSpacing: "-1px",
  margin: "0 0 8px",
  textShadow: "0 2px 16px rgba(255, 255, 255, 0.12)",
};

const brandTagline = {
  fontSize: "11px",
  fontWeight: "700",
  color: "rgba(255, 255, 255, 0.35)",
  letterSpacing: "4px",
  textTransform: "uppercase" as const,
  margin: "0",
};

// Content area
const content = {
  padding: "0 48px 48px",
};

const greeting = {
  fontSize: "18px",
  fontWeight: "600",
  color: "rgba(255, 255, 255, 0.95)",
  margin: "0 0 16px",
  lineHeight: "1.4",
};

const message = {
  fontSize: "15px",
  color: "rgba(255, 255, 255, 0.65)",
  lineHeight: "1.7",
  margin: "0 0 40px",
};

// OTP Section - the star of the show
const otpSection = {
  padding: "40px 32px",
  margin: "0 0 40px",
  backgroundColor: "rgba(0, 0, 0, 0.3)",
  borderRadius: "20px",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.5)",
  textAlign: "center" as const,
};

const otpLabel = {
  fontSize: "11px",
  fontWeight: "800",
  color: "rgba(255, 255, 255, 0.45)",
  letterSpacing: "3px",
  textTransform: "uppercase" as const,
  margin: "0 0 24px",
};

const otpDigitWrapper = {
  display: "inline-block",
  margin: "0 auto",
};

const otpDigit = {
  display: "inline-block",
  width: "64px",
  height: "80px",
  lineHeight: "80px",
  textAlign: "center" as const,
  fontSize: "42px",
  fontWeight: "900",
  color: "#ffffff",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  border: "2px solid rgba(255, 255, 255, 0.18)",
  borderRadius: "16px",
  margin: "0 6px",
  boxShadow: "0 0 30px rgba(255, 255, 255, 0.08), inset 0 2px 4px rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.6)",
  textShadow: "0 2px 16px rgba(255, 255, 255, 0.25)",
  letterSpacing: "-2px",
};

const expiryNote = {
  fontSize: "13px",
  color: "rgba(255, 255, 255, 0.4)",
  margin: "24px 0 0",
  lineHeight: "1.6",
};

// Security warning
const warningBox = {
  padding: "20px 24px",
  margin: "0 0 40px",
  backgroundColor: "rgba(255, 255, 255, 0.015)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.04)",
  textAlign: "center" as const,
};

const warningText = {
  fontSize: "13px",
  color: "rgba(255, 255, 255, 0.45)",
  lineHeight: "1.7",
  margin: "0",
};

// Footer
const divider = {
  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
  margin: "0 0 32px",
};

const footer = {
  fontSize: "13px",
  color: "rgba(255, 255, 255, 0.35)",
  lineHeight: "1.7",
  textAlign: "center" as const,
  margin: "0",
};

const link = {
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: "600",
  borderBottom: "1px solid rgba(255,255,255,0.2)",
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
          {/* Decorative top bar */}
          <div style={topBar} />
          
          {/* Hero section with logo */}
          <Section style={hero}>
            <div style={logoWrapper}>
              <Img
                src="https://huggingface.co/spaces/Unded-17/aethel-backend-v3/resolve/main/shield_logo.png"
                width="40"
                height="40"
                alt="Aethel ATS"
                style={logoImage}
              />
            </div>
            <Heading style={brandName}>Aethel ATS</Heading>
            <Text style={brandTagline}>Precision Recruitment</Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Text style={greeting}>
              Hi {namePlaceholder},
            </Text>
            <Text style={message}>
              Here is your secure verification code to {purposePlaceholder}.
            </Text>

            {/* OTP Section */}
            <div style={otpSection}>
              <Text style={otpLabel}>Verification Code</Text>
              <div style={otpDigitWrapper}>
                {digitPlaceholders.map((digit, i) => (
                  <span key={i} style={otpDigit}>
                    {digit}
                  </span>
                ))}
              </div>
              <Text style={expiryNote}>
                This code expires in <strong style={{color: "#ffffff"}}>10 minutes</strong>
              </Text>
            </div>

            {/* Security warning */}
            <div style={warningBox}>
              <Text style={warningText}>
                If you didn't request this code, you can safely ignore this email.
              </Text>
            </div>

            <Hr style={divider} />

            {/* Footer */}
            <Text style={footer}>
              Secure email from <strong style={{color: "rgba(255,255,255,0.7)"}}>Aethel ATS</strong><br />
              Questions? Reach us at{" "}
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

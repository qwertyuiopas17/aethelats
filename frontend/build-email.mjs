import { render } from '@react-email/render';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import React from 'react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamically import the email component
const VerificationEmailModule = await import('./emails/VerificationEmail.tsx');
const VerificationEmail = VerificationEmailModule.default;

// Render to HTML
const html = await render(React.createElement(VerificationEmail));

// Write to backend templates folder
const outputPath = resolve(__dirname, '../backend/templates/otp_email.html');
writeFileSync(outputPath, html, 'utf-8');

console.log('✅ Email template compiled successfully!');
console.log(`📁 Output: ${outputPath}`);

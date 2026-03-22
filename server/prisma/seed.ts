import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.ticket.createMany({
    data: [
      {
        title: 'Cannot access billing dashboard',
        description:
          'I have been trying to access the billing dashboard for the past two hours but keep getting a 403 Forbidden error. I need to download my invoice for tax purposes urgently.',
        status: 'OPEN',
        priority: 'HIGH',
        aiSummary:
          'User unable to access billing dashboard due to 403 Forbidden error, needs invoice for taxes.',
        aiCategory: 'billing',
        aiSuggestedResponse:
          'I apologize for the inconvenience. We are investigating the 403 error on the billing dashboard. In the meantime, I can email your invoice directly. Could you provide your account email?',
        aiTags: ['billing', 'access-denied', 'dashboard', 'urgent'],
      },
      {
        title: 'Feature request: Dark mode support',
        description:
          'It would be great if the application supported a dark mode theme. Many users work late at night and the bright white interface causes eye strain. This has been requested by multiple team members.',
        status: 'OPEN',
        priority: 'LOW',
        aiSummary:
          'Multiple users requesting dark mode theme to reduce eye strain during nighttime usage.',
        aiCategory: 'feature_request',
        aiSuggestedResponse:
          'Thank you for your suggestion! Dark mode is a popular request and we have added it to our product roadmap. We will notify you when this feature becomes available.',
        aiTags: ['feature-request', 'ui', 'dark-mode', 'accessibility'],
      },
      {
        title: 'Application crashes on file upload',
        description:
          'When I try to upload a PDF file larger than 10MB, the application crashes with a white screen. I have tried different browsers (Chrome, Firefox, Safari) and the issue persists. The error in the console says "Maximum call stack size exceeded".',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        aiSummary:
          'Application crashes with stack overflow when uploading PDF files over 10MB across all browsers.',
        aiCategory: 'bug_report',
        aiSuggestedResponse:
          'Thank you for the detailed report. This appears to be a critical bug in our file upload handler. Our engineering team is actively investigating. As a workaround, please try compressing your PDF to under 10MB.',
        aiTags: [
          'bug',
          'file-upload',
          'crash',
          'stack-overflow',
          'critical',
        ],
      },
    ],
  });
}

main()
  .then(() => {
    process.stdout.write('Seed data created successfully.\n');
  })
  .catch((e) => {
    process.stderr.write(`Seed error: ${e}\n`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

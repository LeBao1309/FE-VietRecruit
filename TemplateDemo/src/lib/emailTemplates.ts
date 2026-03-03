export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface EmailTemplates {
  application_received: EmailTemplate;
  interview_invitation: EmailTemplate;
  job_offer: EmailTemplate;
  rejection: EmailTemplate;
}

export const TEMPLATE_VARIABLES = [
  '{candidate_name}',
  '{job_title}',
  '{company_name}',
  '{meeting_link}',
  '{salary}',
  '{offer_date}',
] as const;

export const DEFAULT_TEMPLATES: EmailTemplates = {
  application_received: {
    subject: 'Application Received — {job_title}',
    body: `Hi {candidate_name},

We received your application for {job_title} at {company_name}. Our team is reviewing it and will get back to you shortly.

Thank you for your interest in joining {company_name}!

Best regards,
HR Team — {company_name}`,
  },
  interview_invitation: {
    subject: 'Interview Invitation — {job_title} at {company_name}',
    body: `Hi {candidate_name},

We are pleased to invite you for an interview for the {job_title} position at {company_name}.

Meeting Link: {meeting_link}

Please confirm your availability at your earliest convenience.

Best regards,
HR Team — {company_name}`,
  },
  job_offer: {
    subject: 'Job Offer — {job_title} at {company_name}',
    body: `Dear {candidate_name},

We are thrilled to offer you the {job_title} position at {company_name}. Your starting salary will be {salary}.

Offer Date: {offer_date}

We believe you will be a great addition to our team and look forward to welcoming you.

Best regards,
HR Team — {company_name}`,
  },
  rejection: {
    subject: 'Update on Your Application — {job_title}',
    body: `Hi {candidate_name},

Thank you for applying to {company_name}. After reviewing your profile for {job_title}, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We genuinely appreciate your time and interest, and encourage you to apply for future opportunities with us.

Best wishes,
HR Team — {company_name}`,
  },
};

const STORAGE_KEY = 'talentos_emailTemplates';

export function loadEmailTemplates(): EmailTemplates {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { ...DEFAULT_TEMPLATES };
}

export function saveEmailTemplates(templates: EmailTemplates): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function replaceVariables(
  text: string,
  vars: Record<string, string>
): string {
  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.split(key).join(value);
  }
  return result;
}

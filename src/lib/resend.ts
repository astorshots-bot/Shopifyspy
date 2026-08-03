import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReportEmail(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({
      from: 'ShopifySpy AI <reports@shopifyspy.ai>',
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
}

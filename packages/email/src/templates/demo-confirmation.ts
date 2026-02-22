export function demoConfirmationEmail(firstName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background-color:#0f172a;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Ascenta</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:600;">Thanks for requesting a demo, ${firstName}!</h2>
              <p style="margin:0 0 16px;color:#475569;font-size:16px;line-height:1.6;">
                We've received your request and a member of our team will be in touch within 24 hours to schedule your personalized demo.
              </p>
              <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6;">
                During the demo, we'll walk you through how Ascenta can transform your HR operations with AI-powered tools tailored to your specific needs.
              </p>
              <p style="margin:0;color:#475569;font-size:16px;line-height:1.6;">
                In the meantime, if you have any questions, feel free to reply to this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 40px;">
              <p style="margin:0;color:#94a3b8;font-size:13px;">
                &mdash; The Ascenta Team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

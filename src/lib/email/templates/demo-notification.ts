import type { DemoRequestInput } from "@/lib/validations/demo-request";

export function demoNotificationEmail(data: DemoRequestInput): string {
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
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">New Demo Request</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6;">
                A new demo has been requested. Here are the details:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                <tr style="background-color:#f8fafc;">
                  <td style="padding:12px 16px;color:#64748b;font-size:14px;font-weight:600;width:40%;border-bottom:1px solid #e2e8f0;">Name</td>
                  <td style="padding:12px 16px;color:#0f172a;font-size:14px;border-bottom:1px solid #e2e8f0;">${data.firstName} ${data.lastName}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">Email</td>
                  <td style="padding:12px 16px;color:#0f172a;font-size:14px;border-bottom:1px solid #e2e8f0;">${data.email}</td>
                </tr>
                <tr style="background-color:#f8fafc;">
                  <td style="padding:12px 16px;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">Company</td>
                  <td style="padding:12px 16px;color:#0f172a;font-size:14px;border-bottom:1px solid #e2e8f0;">${data.company}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">Role</td>
                  <td style="padding:12px 16px;color:#0f172a;font-size:14px;border-bottom:1px solid #e2e8f0;">${data.role}</td>
                </tr>
                <tr style="background-color:#f8fafc;">
                  <td style="padding:12px 16px;color:#64748b;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">Employees</td>
                  <td style="padding:12px 16px;color:#0f172a;font-size:14px;border-bottom:1px solid #e2e8f0;">${data.employeeCount}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;color:#64748b;font-size:14px;font-weight:600;">Phone</td>
                  <td style="padding:12px 16px;color:#0f172a;font-size:14px;">${data.phone || "Not provided"}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

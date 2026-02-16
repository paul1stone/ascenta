export function documentReminderEmail(params: {
  employeeName: string;
  documentTitle: string;
  documentType: string;
  ackUrl: string;
}): string {
  const { employeeName, documentTitle, documentType, ackUrl } = params;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Document Reminder</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#1e293b;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">Ascenta</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;color:#334155;font-size:16px;">Hi ${employeeName},</p>
              <p style="margin:0 0 16px;color:#334155;font-size:16px;">This is a friendly reminder to review and acknowledge the following document that was shared with you:</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:6px;margin:0 0 24px;">
                <tr>
                  <td style="padding:16px;">
                    <p style="margin:0 0 4px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Document</p>
                    <p style="margin:0 0 8px;color:#1e293b;font-size:16px;font-weight:600;">${documentTitle}</p>
                    <p style="margin:0;color:#64748b;font-size:13px;">Type: ${documentType.replace(/_/g, " ")}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;color:#334155;font-size:16px;">Please take a moment to review and acknowledge receipt:</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#2563eb;border-radius:6px;">
                    <a href="${ackUrl}" style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">Acknowledge Receipt</a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;">If the button doesn't work, copy and paste this link into your browser:<br/><a href="${ackUrl}" style="color:#2563eb;">${ackUrl}</a></p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">This email was sent by Ascenta on behalf of your employer.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  // Sécurité : vérifier le secret Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in3DaysEnd = new Date(in3Days);
  in3DaysEnd.setHours(23, 59, 59, 999);
  in3Days.setHours(0, 0, 0, 0);

  // Trouver les abonnements en essai qui expirent dans exactement 3 jours
  const expiringSoon = await prisma.subscription.findMany({
    where: {
      status: "trialing",
      trialEndsAt: {
        gte: in3Days,
        lte: in3DaysEnd,
      },
    },
    include: {
      user: true,
    },
  });

  const results = [];

  for (const sub of expiringSoon) {
    if (!sub.user.email) continue;

    const userName = sub.user.name?.split(" ")[0] || "there";
    const trialEndDate = sub.trialEndsAt
      ? new Date(sub.trialEndsAt).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      : "soon";

    try {
      const { data, error } = await resend.emails.send({
        from: "Verytis <noreply@verytis.com>",
        to: sub.user.email,
        subject: "Your Verytis trial ends in 3 days — keep your access",
        html: trialEndingEmailHtml(userName, trialEndDate),
      });

      if (error) {
        results.push({ email: sub.user.email, status: "error", error });
      } else {
        results.push({ email: sub.user.email, status: "sent", id: data?.id });
      }
    } catch (err) {
      results.push({ email: sub.user.email, status: "exception", error: String(err) });
    }
  }

  return NextResponse.json({
    processed: expiringSoon.length,
    results,
  });
}

function trialEndingEmailHtml(firstName: string, trialEndDate: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Verytis trial is ending soon</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <img src="https://verytis.com/logo.png" alt="Verytis" style="height:44px;width:auto;" />
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:40px;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
              
              <!-- Eyebrow -->
              <p style="margin:0 0 12px 0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#7c3aed;">
                Trial ending soon
              </p>

              <!-- Heading -->
              <h1 style="margin:0 0 16px 0;font-size:26px;font-weight:700;color:#120b2f;line-height:1.3;">
                Hi ${firstName}, your free trial ends on ${trialEndDate}
              </h1>

              <!-- Body -->
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;color:#4b5563;">
                You've been building smarter follow-up workflows with Verytis. Don't lose access to your campaigns, playbooks, and prospect pipeline.
              </p>
              <p style="margin:0 0 28px 0;font-size:16px;line-height:1.6;color:#4b5563;">
                Subscribe now to keep everything running at just <strong>$19.99/month</strong> — cancel anytime.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px auto;">
                <tr>
                  <td style="background-color:#7c3aed;border-radius:8px;">
                    <a href="https://verytis.com/app/settings" 
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.01em;">
                      Subscribe &amp; keep access →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What's included -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f7ff;border-radius:8px;padding:20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 12px 0;font-size:14px;font-weight:700;color:#120b2f;">What's included in Solo plan:</p>
                    <p style="margin:0 0 8px 0;font-size:14px;color:#4b5563;">✅ &nbsp;Unlimited campaigns &amp; targets</p>
                    <p style="margin:0 0 8px 0;font-size:14px;color:#4b5563;">✅ &nbsp;AI-generated playbooks &amp; messages</p>
                    <p style="margin:0 0 8px 0;font-size:14px;color:#4b5563;">✅ &nbsp;Follow-up queue &amp; priority inbox</p>
                    <p style="margin:0;font-size:14px;color:#4b5563;">✅ &nbsp;Data directory &amp; document management</p>
                  </td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;line-height:1.5;">
                If the button doesn't work, go to:<br/>
                <a href="https://verytis.com/app/settings" style="color:#7c3aed;">verytis.com/app/settings</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} Verytis. All rights reserved.<br/>
                You're receiving this email because you signed up for a Verytis trial.
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

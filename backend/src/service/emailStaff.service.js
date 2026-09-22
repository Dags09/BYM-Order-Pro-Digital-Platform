import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import { ENV } from "../config/env.js";

// Create transporter
const createTransporter = () =>
    nodemailer.createTransport({
        host: ENV.SMTP_HOST,
        port: ENV.SMTP_PORT,
        secure: false,
        auth: {
            user: ENV.EMAIL_USER,
            pass: ENV.EMAIL_PASS,
        },
    });
// Password Generation

export const generateSecurePassword = (length = 12) => {
    const charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const result = [];
    while (result.length < length) {
        const byte = randomBytes(1)[0];
        if (byte < Math.floor(256 / charset.length) * charset.length)
            result.push(charset[byte % charset.length]);
    }
    return result.join("");
};

//----------------------------
// HTML Template Helpers
const BASE_STYLES = `
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #1f2937;
        background-color: #f8fafc;
        margin: 0;
        padding: 20px;
    }
    .container {
        max-width: 650px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -1px rgba(0,0,0,.06);
        overflow: hidden;
    }
    .header { color: white; padding: 40px 32px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.025em; }
    .content { padding: 40px 32px; }
    .body-text { font-size: 18px; color: #475569; line-height: 1.7; margin-bottom: 24px; }
    .card { border-radius: 10px; padding: 28px; margin: 32px 0; }
    .card-title { font-weight: 700; font-size: 20px; margin: 0 0 16px 0; }
    .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 2px solid #e2e8f0;
        gap: 16px;
    }
    .detail-row:last-child { border-bottom: none; margin-bottom: 0; }
    .detail-label { font-weight: 600; color: #1e293b; font-size: 16px; }
    .detail-value { color: #475569; font-size: 16px; font-weight: 500; }
    .footer {
        background-color: #f8fafc;
        padding: 32px;
        text-align: center;
        border-top: 2px solid #e2e8f0;
    }
    .footer-text { color: #64748b; font-size: 14px; margin: 0; line-height: 1.6; }
    .btn {
        display: inline-block;
        color: white !important;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        margin-top: 16px;
    }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { background-color: #f1f5f9; padding: 12px; text-align: left; font-weight: 600; color: #1e293b; border-bottom: 2px solid #e2e8f0; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #475569; }
    .total-row td { font-weight: 700; color: #1e293b; border-top: 2px solid #e2e8f0; border-bottom: none; }
    @media only screen and (max-width: 600px) {
        body { padding: 8px !important; }
        .container { border-radius: 8px !important; }
        .header { padding: 24px 16px !important; }
        .header h1 { font-size: 20px !important; }
        .content { padding: 24px 16px !important; }
        .card { padding: 16px !important; }
        .body-text { font-size: 15px !important; }
        .detail-row { flex-direction: column !important; align-items: flex-start !important; gap: 4px !important; }
        .detail-label { font-size: 13px !important; }
        .detail-value { font-size: 14px !important; word-break: break-all !important; }
        .footer { padding: 16px !important; }
        .footer-text { font-size: 12px !important; }
    }
`;

/**
 * Wraps content in the shared email shell (header + footer).
 *
 * @param {object} opts
 * @param {string} opts.title        - <title> tag value
 * @param {string} opts.headerGrad   - CSS gradient string for the header
 * @param {string} opts.extraStyles  - Additional <style> rules
 * @param {string} opts.body         - Inner HTML for the .content div
 */
const buildEmail = ({ title, headerGrad, extraStyles = "", body }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${BASE_STYLES}
        .header { background: ${headerGrad}; }
        ${extraStyles}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>BYM Order Pro Digital Platform</h1>
        </div>
        <div class="content">
            ${body}
        </div>
        <div class="footer">
            <p class="footer-text">
                This is an automated message from the BYM Order Pro Digital Platform.<br>
                Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>`;

// Render Button
const ctaButton = (href, label) =>
    `<a href="${href}" class="btn" style="background: linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);">${label}</a>`;

//Render Grey Background
const infoCard = (rows) => `
    <div class="card" style="background:#f1f5f9; border:2px solid #e2e8f0;">
        ${rows
            .map(
                ([label, value, valueStyle = ""]) => `
            <div class="detail-row">
                <span class="detail-label">${label}</span>
                <span style="width:10px;"></span>
                <span class="detail-value" style="word-break:break-word; max-width:100%; ${valueStyle}">${value}</span>
            </div>`,
            )
            .join("")}
    </div>`;

//---------------------------------------------

const sendMail = async (mailOptions, label) => {
    try {
        const transporter = createTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log(`${label} email sent:`, info.messageId);
        return true;
    } catch (error) {
        console.error(`Error sending ${label} email:`, error);
        return false;
    }
};

//Sends a welcome email to a newly created staff member with their
export const sendAccountEmail = async (userData, verificationToken) => {
    const verificationUrl = `${ENV.FRONTEND_URL}/verify?token=${verificationToken}`;

    const html = buildEmail({
        title: "Account Created",
        headerGrad: "linear-gradient(135deg,#1e293b 0%,#334155 100%)",
        extraStyles: `
            .verify-card {
                background: linear-gradient(135deg,#dbeafe 0%,#bfdbfe 100%);
                border: 2px solid #3b82f6; text-align: center;
            }
            .verify-card .card-title { color: #1e40af; }
            .verify-card p { color: #1e40af; font-size: 16px; margin: 0 0 8px 0; }
            .warn-banner {
                background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px;
                padding: 20px; margin: 24px 0; color: #dc2626;
                font-weight: 600; text-align: center;
            }`,
        body: `
            <p class="body-text">Hello <strong>${userData.firstName} ${userData.lastName}</strong>,</p>
            <p class="body-text">
                Your account has been successfully created in the BYM Order Pro Digital Platform.
                Below are your account details:
            </p>
            ${infoCard([
                ["Full Name:", ` ${userData.firstName} ${userData.lastName}`],
                ["Email: ", userData.email],
                ["Phone Number: ", userData.phoneNumber],
                ["Role: ", userData.role],
            ])}
            <div class="card verify-card">
                <p class="card-title">✅ Next Step: Verify Your Email</p>
                <p>To complete your account setup, please verify your email address:</p>
                ${ctaButton(verificationUrl, "Verify Email Address")}
            </div>
            <div class="warn-banner">⚠️ Keep your password secure and do not share it with anyone.</div>
            <p style="margin:32px 0 0 0; color:#64748b; font-size:16px; line-height:1.6;">
                If you have any questions, please contact the system administrator.
            </p>`,
    });

    return sendMail(
        {
            from: ENV.SMTP_FROM,
            to: userData.email,
            subject: "Your Account Details - BYM Order Pro Digital Platform",
            html,
        },
        "Account",
    );
};

export const sendPasswordResetEmail = async (userData, resetToken) => {
    const resetUrl = `${ENV.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = buildEmail({
        title: "Password Reset",
        headerGrad: "linear-gradient(135deg,#1d4ed8 0%,#1e3a8a 100%)",
        extraStyles: `
            .reset-card { background: linear-gradient(135deg,#eff6ff 0%,#bfdbfe 100%); border: 2px solid #3b82f6; text-align: center; }
            .reset-card .card-title { color: #1d4ed8; }
            .token-info { font-size: 14px; color: #1e40af; margin-top: 20px; }
            .warning-card {
                background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 8px;
                padding: 20px; margin: 24px 0; color: #b91c1c; font-weight: 600; text-align: center;
            }`,
        body: `
            <p class="body-text">Hello <strong>${userData.firstName} ${userData.lastName}</strong>,</p>
            <p class="body-text">
                We received a request to reset the password for your account.
                If you made this request, click the button below to choose a new password.
            </p>
            <div class="card reset-card">
                <p class="card-title">Reset Your Password</p>
                ${ctaButton(resetUrl, "Create a New Password")}
                <p class="token-info">
                    This link will expire in <strong>1 hour</strong>.
                    If it expires, you can request a new reset from the login page.
                </p>
            </div>
            <div class="warning-card">
                ⚠️ If you did not request a password reset, please ignore this email.
                Your password will remain unchanged.
            </div>
            <p class="body-text" style="margin-top:32px;">
                For your security, do not share this email or the reset link with anyone.
            </p>`,
    });

    return sendMail(
        {
            from: ENV.SMTP_FROM,
            to: userData.email,
            subject:
                "Password Reset Instructions - BYM Order Pro Digital Platform",
            html,
        },
        "Password reset",
    );
};

// Notifies a staff member that their account has been enabled or disabled.
export const sendAccountStatusEmail = async (userData, isEnabled) => {
    const statusLabel = isEnabled ? "Enabled" : "Disabled";
    const statusIcon = isEnabled ? "✅" : "❌";
    const statusColor = isEnabled ? "#059669" : "#dc2626";
    const bannerGrad = isEnabled
        ? "linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)"
        : "linear-gradient(135deg,#fef2f2 0%,#fee2e2 100%)";
    const bannerBorder = isEnabled ? "#a7f3d0" : "#fecaca";
    const actionGrad = isEnabled
        ? "linear-gradient(135deg,#fef3c7 0%,#fde68a 100%)"
        : "linear-gradient(135deg,#fef2f2 0%,#fecaca 100%)";
    const actionBorder = isEnabled ? "#f59e0b" : "#f87171";
    const actionTitle = isEnabled
        ? "🎉 Account Reactivated!"
        : "⚠️ Account Deactivated";
    const actionMessage = isEnabled
        ? "Your account is now active and you can access the system. If you experience any issues logging in, please contact the administrator."
        : "Your account access has been temporarily suspended. Please contact your administrator for more information.";

    const html = buildEmail({
        title: `Account ${statusLabel}`,
        headerGrad: "linear-gradient(135deg,#1e293b 0%,#334155 100%)",
        extraStyles: `
            .status-banner {
                background: ${bannerGrad}; border: 3px solid ${bannerBorder};
                border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center;
            }
            .status-icon  { font-size: 48px; margin-bottom: 20px; }
            .status-text  { font-size: 24px; font-weight: 700; color: ${statusColor}; margin: 0; }
            .action-card  {
                background: ${actionGrad}; border: 2px solid ${actionBorder};
                border-radius: 10px; padding: 28px; margin: 32px 0;
            }
            .action-title { color: ${statusColor}; font-weight: 700; margin: 0 0 16px 0; font-size: 20px; }
            .action-text  { color: ${statusColor}; margin: 0; font-size: 16px; line-height: 1.6; }`,
        body: `
            <p class="body-text">Hello <strong>${userData.firstName} ${userData.lastName}</strong>,</p>
            <div class="status-banner">
                <div class="status-icon">${statusIcon}</div>
                <p class="status-text">Your account has been ${statusLabel.toLowerCase()}</p>
            </div>
            <p class="body-text">
                This is to inform you that your account status in the BYM Order Pro Digital Platform has been updated.
            </p>
            ${infoCard([
                ["Full Name: ", `${userData.firstName} ${userData.lastName}`],
                ["Email: ", userData.email],
                ["Phone Number: ", userData.phoneNumber],
                [
                    "Current Status: ",
                    isEnabled ? "Active" : "Inactive",
                    `color:${statusColor}; font-weight:600; font-size:18px;`,
                ],
            ])}
            <div class="action-card">
                <p class="action-title">${actionTitle}</p>
                <p class="action-text">${actionMessage}</p>
            </div>
            <p style="margin:32px 0 0 0; color:#64748b; font-size:16px; line-height:1.6;">
                If you have questions about this change, please contact the system administrator.
            </p>`,
    });

    return sendMail(
        {
            from: ENV.SMTP_FROM,
            to: userData.email,
            subject: `Account ${statusLabel} - BYM Order Pro Digital Platform`,
            html,
        },
        `Account ${statusLabel.toLowerCase()}`,
    );
};

// Notifies a driver that they have been assigned to a delivery, including order details and customer information.
export const sendDriverAssignmentEmail = async ({
    to,
    driverName,
    orderId,
    customer,
    shippingAddress,
    items,
    totalAmount,
    scheduledDeliveryDate,
    note,
}) => {
    const itemRows = items
        .map(
            (item) => `
        <tr>
            <td>${item.product.name}</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">₱${item.price.toFixed(2)}</td>
            <td style="text-align:right;">₱${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `,
        )
        .join("");

    const formattedDate = new Date(scheduledDeliveryDate).toLocaleString(
        "en-PH",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    );

    const html = buildEmail({
        title: "New Delivery Assignment",
        headerGrad: "linear-gradient(135deg,#1e293b 0%,#334155 100%)",
        extraStyles: `
            .assignment-banner {
                background: linear-gradient(135deg,#dbeafe 0%,#bfdbfe 100%);
                border: 2px solid #3b82f6;
                border-radius: 12px;
                padding: 32px;
                margin: 32px 0;
                text-align: center;
            }
            .assignment-icon { font-size: 48px; margin-bottom: 16px; }
            .assignment-text { font-size: 22px; font-weight: 700; color: #1d4ed8; margin: 0; }
            .section-title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 32px 0 8px 0; }
        `,
        body: `
            <p class="body-text">Hello <strong>${driverName}</strong>,</p>
            <div class="assignment-banner">
                <div class="assignment-icon">🚚</div>
                <p class="assignment-text">You have a new delivery assignment!</p>
            </div>
            <p class="body-text">Please review the details below and proceed to the customer's location.</p>

            <p class="section-title">🗓️ Scheduled Delivery</p>
            ${infoCard([
                [
                    "Delivery Date:",
                    formattedDate,
                    "color:#1d4ed8; font-weight:700;",
                ],
            ])}

            <p class="section-title">👤 Customer Information</p>
            ${infoCard([
                ["Name:", customer.name],
                ["Phone:", customer.phone],
                ["Email:", customer.email],
            ])}

            <p class="section-title">📍 Delivery Address</p>
            ${infoCard([
                ["Street:", shippingAddress.street],
                ["City:", shippingAddress.city],
                ["Province:", shippingAddress.province],
                ["Zip Code:", shippingAddress.zipCode],
            ])}
            ${
                note
                    ? `
                <p class="section-title">📝 Note from Customer</p>
                <div class="card" style="background:#fefce8; border:2px solid #fde68a;">
                    <p style="margin:0; color:#92400e; font-size:16px; line-height:1.6;">${note}</p>
                </div>
            `
                    : ""
            }

            <p class="section-title">📦 Order Items</p>
            <div class="card" style="background:#f1f5f9; border:2px solid #e2e8f0; padding: 0; overflow: hidden;">
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th style="text-align:center;">Qty</th>
                            <th style="text-align:right;">Price</th>
                            <th style="text-align:right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="3" style="text-align:right;">Total Amount</td>
                            <td style="text-align:right;">₱${totalAmount.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <p style="margin:32px 0 0 0; color:#64748b; font-size:16px; line-height:1.6;">
                If you have any questions, please contact the administrator.
            </p>
        `,
    });

    return sendMail(
        {
            from: ENV.SMTP_FROM,
            to,
            subject: `New Delivery Assignment - Order #${orderId} - BYM Order Pro Digital Platform`,
            html,
        },
        "Driver assignment",
    );
};

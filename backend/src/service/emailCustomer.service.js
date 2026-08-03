import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

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

const buildEmail = ({ title, headerGrad, extraStyles = '', body }) => `
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

const infoCard = (rows) => `
    <div class="card" style="background:#f1f5f9; border:2px solid #e2e8f0;">
        ${rows.map(([label, value, valueStyle = '']) => `
            <div class="detail-row">
                <span class="detail-label">${label}</span>
                <span style="width:10px;"></span>
                <span class="detail-value" style="word-break:break-word; max-width:100%; ${valueStyle}">${value}</span>
            </div>`
        ).join('')}
    </div>`;

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

export const sendOrderReceipt = async ({ to, customerName, orderId, items, totalAmount }) => {
    const itemRows = items.map(item => `
        <tr>
            <td>${item.product.name}</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">₱${item.price.toFixed(2)}</td>
            <td style="text-align:right;">₱${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const html = buildEmail({
        title: 'Order Receipt',
        headerGrad: 'linear-gradient(135deg,#1d4ed8 0%,#1e3a8a 100%)',
        extraStyles: `
            .success-banner {
                background: linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%);
                border: 2px solid #a7f3d0;
                border-radius: 12px;
                padding: 32px;
                margin: 32px 0;
                text-align: center;
            }
            .success-icon { font-size: 48px; margin-bottom: 16px; }
            .success-text { font-size: 22px; font-weight: 700; color: #059669; margin: 0; }
            .section-title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 32px 0 8px 0; }
        `,
        body: `
            <p class="body-text">Hello <strong>${customerName}</strong>,</p>
            <div class="success-banner">
                <div class="success-icon">🎉</div>
                <p class="success-text">Your order has been placed successfully!</p>
            </div>
            <p class="body-text">Thank you for your order. Here is your receipt:</p>

            <p class="section-title">🧾 Order Summary</p>
            ${infoCard([
                ['Order ID:', `#${orderId}`],
                ['Status:', 'Pending', 'color:#d97706; font-weight:600;'],
                ['Total Amount:', `₱${totalAmount.toFixed(2)}`, 'color:#1d4ed8; font-weight:700; font-size:18px;'],
            ])}

            <p class="section-title">📦 Items Ordered</p>
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
                We will notify you once your order is on its way. 
                If you have any questions, please contact our support team.
            </p>
        `
    });

    return sendMail(
        { from: ENV.SMTP_FROM, to, subject: `Order Receipt #${orderId} - BYM Order Pro Digital Platform`, html },
        'Order receipt'
    );
};

export const sendOrderStatusEmail = async ({ to, customerName, orderId, status, driverLocation, scheduledDeliveryDate }) => {
    const statusConfig = {
        processing: {
            icon: '⚙️',
            color: '#d97706',
            grad: 'linear-gradient(135deg,#fef3c7 0%,#fde68a 100%)',
            border: '#f59e0b',
            message: 'Your order is currently being processed and a driver has been assigned to deliver it.'
        },
        shipped: {
            icon: '🚚',
            color: '#2563eb',
            grad: 'linear-gradient(135deg,#dbeafe 0%,#bfdbfe 100%)',
            border: '#3b82f6',
            message: 'Your order is now on its way! Our driver is heading to your location.'
        },
        delivered: {
            icon: '✅',
            color: '#059669',
            grad: 'linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)',
            border: '#a7f3d0',
            message: 'Your order has been successfully delivered. Thank you for shopping with us!'
        }
    };

    const config = statusConfig[status];
    if (!config) return;

    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

    const scheduledSection = scheduledDeliveryDate
        ? `
            <p class="section-title">🗓️ Expected Delivery Date</p>
            ${infoCard([
                ['Scheduled Date:', new Date(scheduledDeliveryDate).toLocaleString('en-PH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }), 'color:#1d4ed8; font-weight:700;']
            ])}
        `
        : '';

    const locationSection = driverLocation?.latitude && driverLocation?.longitude
    ? `
        <p class="section-title">📍 Driver's Current Location</p>
        ${infoCard([
            ['Latitude:', driverLocation.latitude.toString()],
            ['Longitude:', driverLocation.longitude.toString()],
            ['Last Updated:', new Date(driverLocation.updatedAt).toLocaleString('en-PH')],
        ])}
        
            href="https://www.google.com/maps?q=${driverLocation.latitude},${driverLocation.longitude}"
            style="
                display: inline-block;
                background: linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);
                color: white;
                text-decoration: none;
                padding: 14px 28px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin-top: 8px;
            "
        >📍 View on Google Maps</a>
    `
    : '';

    const html = buildEmail({
        title: `Order ${statusLabel}`,
        headerGrad: 'linear-gradient(135deg,#1d4ed8 0%,#1e3a8a 100%)',
        extraStyles: `
            .status-banner {
                background: ${config.grad};
                border: 2px solid ${config.border};
                border-radius: 12px;
                padding: 32px;
                margin: 32px 0;
                text-align: center;
            }
            .status-icon { font-size: 48px; margin-bottom: 16px; }
            .status-text { font-size: 22px; font-weight: 700; color: ${config.color}; margin: 0; }
            .section-title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 32px 0 8px 0; }
        `,
        body: `
            <p class="body-text">Hello <strong>${customerName}</strong>,</p>
            <div class="status-banner">
                <div class="status-icon">${config.icon}</div>
                <p class="status-text">Order ${statusLabel}!</p>
            </div>
            <p class="body-text">${config.message}</p>

            <p class="section-title">🧾 Order Details</p>
            ${infoCard([
                ['Order ID:', `#${orderId}`],
                ['Status:', statusLabel, `color:${config.color}; font-weight:600;`],
            ])}

            ${scheduledSection}
            ${locationSection}

            <p style="margin:32px 0 0 0; color:#64748b; font-size:16px; line-height:1.6;">
                If you have any questions about your order, please contact our support team.
            </p>
        `
    });

    return sendMail(
        { from: ENV.SMTP_FROM, to, subject: `Order #${orderId} is now ${statusLabel} - BYM Order Pro Digital Platform`, html },
        'Order status'
    );
};
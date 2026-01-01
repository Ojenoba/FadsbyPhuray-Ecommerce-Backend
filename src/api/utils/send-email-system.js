import sql from "./sql.js";

const SENDER_EMAIL = "noreply@fadsbyphuray.com";
const SENDER_NAME = "FADs by PHURAY";

// Simulated email sending (replace with actual email service like SendGrid/Mailgun)
export async function sendEmail({ to, subject, body, templateName }) {
  try {
    // In production, integrate with SendGrid, Mailgun, or AWS SES
    // For now, we'll log it and save to database

    console.log(`📧 Email to ${to}: ${subject}`);

    // Save to email logs
    await sql`
      INSERT INTO email_logs (recipient_email, subject, template_name, status)
      VALUES (${to}, ${subject}, ${templateName}, 'sent')
    `;

    return { success: true, message: "Email queued for sending" };
  } catch (error) {
    console.error("Error sending email:", error);
    await sql`
      INSERT INTO email_logs (recipient_email, subject, template_name, status)
      VALUES (${to}, ${subject}, ${templateName}, 'failed')
    `;
    throw error;
  }
}

// Get template and replace variables
export async function getEmailTemplate(templateName, variables = {}) {
  try {
    const [template] = await sql`
      SELECT * FROM email_templates 
      WHERE name = ${templateName} AND is_active = true
    `;

    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    let body = template.body;
    let subject = template.subject;

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      body = body.replaceAll(placeholder, value);
      subject = subject.replaceAll(placeholder, value);
    });

    return { subject, body };
  } catch (error) {
    console.error("Error getting email template:", error);
    throw error;
  }
}

// Send order confirmation
export async function sendOrderConfirmation(user, order, items) {
  try {
    const { subject, body } = await getEmailTemplate("order_confirmation", {
      order_id: order.id,
      total: `₦${order.total_amount.toLocaleString()}`,
      customer_name: user.name,
    });

    await sendEmail({
      to: user.email,
      subject,
      body,
      templateName: "order_confirmation",
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending order confirmation:", error);
    throw error;
  }
}

// Send order shipped notification
export async function sendOrderShipped(user, order, trackingNumber) {
  try {
    const { subject, body } = await getEmailTemplate("order_shipped", {
      order_id: order.id,
      tracking_number: trackingNumber || "Coming soon",
    });

    await sendEmail({
      to: user.email,
      subject,
      body,
      templateName: "order_shipped",
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending order shipped notification:", error);
    throw error;
  }
}

// Send order delivered notification
export async function sendOrderDelivered(user, order) {
  try {
    const { subject, body } = await getEmailTemplate("order_delivered", {
      order_id: order.id,
    });

    await sendEmail({
      to: user.email,
      subject,
      body,
      templateName: "order_delivered",
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending order delivered notification:", error);
    throw error;
  }
}

// Send password reset email
export async function sendPasswordReset(user, resetLink) {
  try {
    const { subject, body } = await getEmailTemplate("password_reset", {
      reset_link: resetLink,
      user_name: user.name,
    });

    await sendEmail({
      to: user.email,
      subject,
      body,
      templateName: "password_reset",
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

// Send review request
export async function sendReviewRequest(user, product) {
  try {
    const { subject, body } = await getEmailTemplate("review_request", {
      product_name: product.name,
      user_name: user.name,
    });

    await sendEmail({
      to: user.email,
      subject,
      body,
      templateName: "review_request",
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending review request:", error);
    throw error;
  }
}

// Get all email logs (for admin dashboard)
export async function getEmailLogs(limit = 50) {
  try {
    const logs = await sql`
      SELECT * FROM email_logs 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    return logs;
  } catch (error) {
    console.error("Error getting email logs:", error);
    throw error;
  }
}

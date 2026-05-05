import os
import resend

# 1. Auto-Reply (Immediate)
def send_auto_acknowledgment(user_email: str, user_name: str):
    subject = "We received your message! 📬"
    body = f"""
    <h3>Hi {user_name},</h3>
    <p>Thanks for reaching out to Crave Support.</p>
    <p>We have received your message and will get back to you within 24-48 hours.</p>
    <br>
    <p>Best Regards,<br>Crave Team</p>
    """
    _send_email(user_email, subject, body)

# 2. Admin Reply (Manual)
def send_admin_reply_email(user_email: str, user_name: str, original_msg: str, admin_reply: str):
    subject = "Re: Response to your inquiry 💬"
    body = f"""
    <h3>Hi {user_name},</h3>
    <p>Here is the response to your recent inquiry:</p>
    
    <div style="border-left: 3px solid #ccc; padding-left: 10px; margin: 10px 0; color: #555;">
        <em>"{original_msg}"</em>
    </div>
    
    <p><strong>Our Response:</strong></p>
    <p>{admin_reply}</p>
    <br>
    <p>Best Regards,<br>Crave Team</p>
    """
    _send_email(user_email, subject, body)

# Internal Helper (UPDATED TO USE RESEND)
def _send_email(to_email, subject, body):
    # Fetch the Resend API key from your Render environment variables
    resend.api_key = os.getenv("RESEND_API_KEY")
    
    if not resend.api_key:
        print(f"⚠️ Mock Email to {to_email} (Missing RESEND_API_KEY): {subject}")
        return

    # Build the email payload
    params = {
        "from": "Crave Support <onboarding@resend.dev>",
        "to": [to_email],
        "subject": subject,
        "html": body,
    }

    try:
        # Send the email via HTTP API
        email = resend.Emails.send(params)
        print(f"✅ Email sent successfully via Resend to {to_email}")
    except Exception as e:
        print(f"❌ Email Failed: {e}")
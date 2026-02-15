import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

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

# Internal Helper
def _send_email(to_email, subject, body):
    sender_email = os.getenv("MAIL_USERNAME")
    sender_password = os.getenv("MAIL_PASSWORD")
    
    if not sender_email:
        print(f"⚠️ Mock Email to {to_email}: {subject}")
        return

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
    except Exception as e:
        print(f"❌ Email Failed: {e}")
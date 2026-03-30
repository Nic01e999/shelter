"""邮件服务"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_reset_code(email: str, code: str) -> bool:
    """发送密码重置验证码"""
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    smtp_host = os.getenv('SMTP_HOST')

    if not all([smtp_user, smtp_password, smtp_host]):
        print(f"\n{'='*50}")
        print(f"📧 验证码邮件（开发模式）")
        print(f"{'='*50}")
        print(f"收件人: {email}")
        print(f"验证码: {code}")
        print(f"有效期: 10 分钟")
        print(f"{'='*50}\n")
        return True

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'SHELTER - 密码重置验证码'
        msg['From'] = os.getenv('SMTP_USER')
        msg['To'] = email

        html = f"""
        <html>
          <body style="margin:0;padding:0;background:#1a1a1a;font-family:Arial,sans-serif">
            <div style="max-width:600px;margin:40px auto;background:linear-gradient(135deg,#2a2a2a,#1a1a1a);border-radius:12px;padding:40px;border:1px solid #333">
              <h1 style="color:#ff8c42;margin:0 0 20px 0;font-size:24px">SHELTER</h1>
              <p style="color:#ccc;font-size:16px;line-height:1.6;margin:0 0 30px 0">
                您正在重置密码，验证码为：
              </p>
              <div style="background:#2a2a2a;border:2px solid #ff8c42;border-radius:8px;padding:20px;text-align:center;margin:0 0 30px 0">
                <span style="color:#ff8c42;font-size:32px;font-weight:bold;letter-spacing:8px">{code}</span>
              </div>
              <p style="color:#999;font-size:14px;line-height:1.6;margin:0">
                验证码有效期为 10 分钟，请勿泄露给他人。<br>
                如非本人操作，请忽略此邮件。
              </p>
            </div>
          </body>
        </html>
        """

        msg.attach(MIMEText(html, 'html'))

        with smtplib.SMTP_SSL(os.getenv('SMTP_HOST'), int(os.getenv('SMTP_PORT', 465))) as server:
            server.login(os.getenv('SMTP_USER'), os.getenv('SMTP_PASSWORD'))
            server.send_message(msg)

        return True
    except Exception as e:
        print(f"邮件发送失败: {e}")
        return False

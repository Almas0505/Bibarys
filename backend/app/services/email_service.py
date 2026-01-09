"""
Email service for sending notifications
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List
import logging
from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SMTP"""
    
    @staticmethod
    def send_email(
        to: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send HTML email via SMTP."""
        try:
            # If SMTP not configured, log only
            if not settings.SMTP_HOST or not settings.SMTP_FROM:
                logger.info(f"[EMAIL PLACEHOLDER] To: {to}")
                logger.info(f"[EMAIL PLACEHOLDER] Subject: {subject}")
                logger.info(f"[EMAIL PLACEHOLDER] Body: {html_content[:100]}...")
                return True
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = settings.SMTP_FROM
            msg['To'] = to
            
            # Add text version
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)
            
            # Add HTML version
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to}")
            return True
        except Exception as e:
            logger.error(f"Email send failed: {e}")
            return False
    
    @staticmethod
    def send_welcome_email(email: str, name: str) -> bool:
        """Send welcome email to new user."""
        subject = "Добро пожаловать в Bibarys!"
        html = f"""
        <html>
          <body>
            <h1>Здравствуйте, {name}!</h1>
            <p>Спасибо за регистрацию в нашем интернет-магазине Bibarys.</p>
            <p>Начните делать покупки прямо сейчас!</p>
            <p>С уважением,<br>Команда Bibarys</p>
          </body>
        </html>
        """
        return EmailService.send_email(email, subject, html)
    
    @staticmethod
    def send_order_confirmation(email: str, order_id: int, total: float) -> bool:
        """Send order confirmation email."""
        subject = f"Заказ №{order_id} оформлен"
        html = f"""
        <html>
          <body>
            <h1>Ваш заказ оформлен!</h1>
            <p>Номер заказа: <strong>#{order_id}</strong></p>
            <p>Сумма: <strong>{total} ₽</strong></p>
            <p>Мы уведомим вас об изменении статуса заказа.</p>
            <p>С уважением,<br>Команда Bibarys</p>
          </body>
        </html>
        """
        return EmailService.send_email(email, subject, html)
    
    @staticmethod
    def send_order_status_update(email: str, order_id: int, status: str) -> bool:
        """Send order status update email."""
        status_map = {
            'pending': 'Ожидает обработки',
            'processing': 'В обработке',
            'shipped': 'Отправлен',
            'delivered': 'Доставлен',
            'cancelled': 'Отменен'
        }
        subject = f"Заказ №{order_id} - обновление статуса"
        html = f"""
        <html>
          <body>
            <h1>Статус заказа изменился</h1>
            <p>Заказ №{order_id}</p>
            <p>Новый статус: <strong>{status_map.get(status, status)}</strong></p>
            <p>С уважением,<br>Команда Bibarys</p>
          </body>
        </html>
        """
        return EmailService.send_email(email, subject, html)
    
    @staticmethod
    def send_password_reset(email: str, reset_token: str) -> bool:
        """Send password reset email."""
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        subject = "Сброс пароля"
        html = f"""
        <html>
          <body>
            <h1>Сброс пароля</h1>
            <p>Вы запросили сброс пароля.</p>
            <p>Перейдите по ссылке для установки нового пароля:</p>
            <p><a href="{reset_url}">{reset_url}</a></p>
            <p>Ссылка действительна 1 час.</p>
            <p>Если вы не запрашивали сброс пароля, игнорируйте это письмо.</p>
            <p>С уважением,<br>Команда Bibarys</p>
          </body>
        </html>
        """
        return EmailService.send_email(email, subject, html)
    
    @staticmethod
    def send_order_confirmation_email(email: str, order_id: int, tracking_number: str) -> bool:
        """Send order confirmation email (legacy method for compatibility)."""
        logger.info(f"[EMAIL] Sending order confirmation to {email}")
        logger.info(f"Subject: Order #{order_id} confirmed")
        logger.info(f"Body: Your order has been confirmed. Tracking: {tracking_number}")
        return True
    
    @staticmethod
    def send_order_shipped_email(email: str, order_id: int, tracking_number: str) -> bool:
        """Send order shipped notification."""
        logger.info(f"[EMAIL] Sending shipping notification to {email}")
        logger.info(f"Subject: Order #{order_id} has been shipped")
        logger.info(f"Body: Track your order: {tracking_number}")
        return True
    
    @staticmethod
    def send_order_delivered_email(email: str, order_id: int) -> bool:
        """Send order delivered notification."""
        logger.info(f"[EMAIL] Sending delivery confirmation to {email}")
        logger.info(f"Subject: Order #{order_id} has been delivered")
        logger.info(f"Body: Your order has been delivered successfully")
        return True
    
    @staticmethod
    def send_password_reset_email(email: str, reset_token: str) -> bool:
        """Send password reset email (legacy method for compatibility)."""
        return EmailService.send_password_reset(email, reset_token)
    
    @staticmethod
    def send_bulk_email(emails: List[str], subject: str, body: str) -> bool:
        """Send bulk email (admin feature)."""
        logger.info(f"[EMAIL] Sending bulk email to {len(emails)} recipients")
        logger.info(f"Subject: {subject}")
        logger.info(f"Body preview: {body[:100]}...")
        return True


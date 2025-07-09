# app/services/email_service.py
import os
from flask_mail import Message
from app import mail

def send_email(subject: str, recipients: list[str], html_body: str):
    msg = Message(
        subject,
        recipients=recipients,
        html=html_body,
        sender=os.getenv("SENDER_MAIL")
    )
    mail.send(msg)
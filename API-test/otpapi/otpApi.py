from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
import ssl
import random
import string
from email.message import EmailMessage

app = Flask(__name__)
CORS(app)  # Enable CORS for the app

# Define your email configuration here
email_sender = 'siddhant21101@iiitd.ac.in'
email_password = 'eecyqsxlekdycjtn'

# Function to generate a random OTP
def generate_otp():
    otp=""
    for i in range(6):
        otp+=(random.choice(string.digits))
    return otp

# Function to send an OTP via email
def send_otp_via_email(receiver_email, otp):
    subject = 'Your OTP Code'
    body = f'Your OTP code is: {otp}'
    em = EmailMessage()
    em['From'] = email_sender
    em['To'] = receiver_email
    em['Subject'] = subject
    em.set_content(body)

    context = ssl.create_default_context()

    with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
        smtp.login(email_sender, email_password)
        smtp.sendmail(email_sender, receiver_email, em.as_string())

@app.route('/otp', methods=['POST'])
def generate_otp_endpoint():
    if request.method == 'POST':
        data = request.get_json()
        if 'email' in data:
            receiver_email = data['email']
            otp = generate_otp()
            send_otp_via_email(receiver_email, otp)
            return jsonify({'otp': otp})
        else:
            return jsonify({'error': 'Email not provided'}), 400
    return jsonify({'error': 'Invalid request method'}), 405

if __name__ == '__main__':
    app.run(debug=True, port=5003)

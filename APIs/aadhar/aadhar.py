import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
from pyzbar.pyzbar import decode
from aadhaar.secure_qr import extract_data
from PIL import Image

from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
import hashlib

app = Flask(__name__)
CORS(app)

@app.route('/process_image', methods=['POST'])
def process_image():
    print(request.files)
    try:
        file = request.files['image']
        if not file:
            return jsonify({'error': 'No file provided'}), 400
        image_path = 'temp_image.jpg'
        file.save(image_path)
        image = cv2.imread(image_path)
        decoded_objects = decode(image)
        received_qr_code_data = int(decoded_objects[0].data)
        extracted_data = extract_data(received_qr_code_data)
        name = extracted_data.to_dict()["text_data"]["name"]
        dob = extracted_data.to_dict()["text_data"]["date_of_birth"]
        os.remove(image_path)
        print(name, dob)
        return jsonify({'name': name, 'dob': dob}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/v', methods=['POST'])
def verify_certificate():
    certificate_data = request.files['certificate_data']
    certificate_data=certificate_data.read()
    certificate_data=certificate_data.decode("utf-8")
    certificate_data=certificate_data.split("\r\n")
    text=certificate_data
    text=text[:-1]
    sign=certificate_data[-1]
    sign=sign.split(":")[1]
    signature=sign
    a=""
    for i in text:
        a+=i+'\n'
    text=a.rstrip('\n')

    def hashs(text):
        hash_obj = hashlib.sha256()
        hash_obj.update(text.encode())
        hash_hex = hash_obj.hexdigest()
        return hash_hex
    h = hashs(text)
    def decrypt(signature_bytes):
        p=certificate_data
        p = p[5:-1]
        a = ""
        for i in p:
            a += i+"\n"
        public_key_text = a
        
        public_key = RSA.import_key(public_key_text)
        cipher = PKCS1_OAEP.new(public_key)
        decrypted_hash = cipher.decrypt(signature_bytes)
        return decrypted_hash.hex()

    signature_bytes = bytes.fromhex(signature)
    decrypted_signature = decrypt(signature_bytes)
    if h == decrypted_signature:
        return jsonify({"message": "The certificate is valid"})
    else:
        return jsonify({"message": "Someone has tampered with this certificate"})

def hash(text):
    try:
        hash_obj = hashlib.sha256()
        hash_obj.update(text.encode())
        return hash_obj.digest()
    except Exception as e:
        print(e)
def encrypt(cipher,text):
    try:
        # text_bytes = bytes.fromhex(text)
        # text=text_bytes.decode("utf-8")
        encrypted_hash = cipher.encrypt(text)
        #encrypted_hash=encrypted_hash.decode("utf-8")
        return encrypted_hash.hex()
    except Exception as e:
        print(e)


@app.route('/g', methods=['POST'])
def generate_certificate():
    try:
        # private_key_file = request.files['private_key']
        print(request.json)
        data=request.json
        if 'name' in data and 'dob' in data and 'current_date' in data and 'type' in data:
            result = f"Name:{data['name']}\nDOB:{data['dob']}\nCurrent Date:{data['current_date']}\nType:{data['type']}"
            input_text=result
        else:
            return jsonify({'error': 'Missing one or more required fields'}), 400
        print(result)
        input_text+="\nAggregator Public Key:"
        public_key="-----BEGIN RSA PUBLIC KEY-----\nMIICWgIBAAKBgHVazR1UTbITd7aPPilxuqL6WCTR5nI438aEvRrwjewv5KEmbaGJ\nEC1AuK9dC47GRg00U/7SYnaUiL1XcOQ5v9fsAqsb9tBh69f1sX5hV3ZovWIzQs5G\nEh0EM4xr6uu34wWNBbohlZYy8ls8qL6xKF0HOAugOTxC5CHQ4memcZrFAgMBAAEC\ngYBuZeEXejstDotLvi0oJ8j/kKpi2OMFCOPaiPys3ydjzRozT0dK8vm42G3k6o74\n3SUBPvzVd20RSGHqXNvil0EUtqhVGDs+9XlHVLvdpEl8uhZX6Dx03byVmO4J8JO2\ne0GUus37xWafnAeCvPSrnEcADOqFKq8/pmebMB1QkoY68QJBAOigHm7lKh/kZh1C\nbYdayywCUMwvqLin5M3n2GKSQAkC1QUc+TnRc7Q/sngYP0iREIm68SUXwSGa+A1H\nncPAxy8CQQCBJYtcj94HdqhZV6dD5FC8D9m3pTAsXEU+gJNWo7LyF/J+TDddpkAU\n7uPP6T03Yh1A51hHhhc8B6p0W/xcrMBLAkBvuZdkQ4Q71QKGQwU/4Qd7l5EewDUU\nmu51RkjS7tL6gPW2gvfgIQylIYKh02Nxgtqii7qNyh7j+P3xwteu0MPZAkA+cbDY\nqJdqdG0iBcfSg+qlg+R5b13DlTnF5tVW5v/3Hq0ZdDCxD1mcxYVRWi1HQiFy6Gk+\n7A7/75TzfiafiMfRAkBdKX9t1DCNYH+hZCxpGzV1ERgVjJYrgGUnaRlEQtkVG1yC\nT+yGxXxamJPPNilot00IxloG6MOl4V56Yj6C+57D\n-----END RSA PUBLIC KEY-----"
        input_text+="\n"+public_key
        # input_file = request.files['input_text']
        # input_text=input_file.read()
        # Load the private key
        f = open("../certificate/private_key.pem", "r")
        private_key_text = f.read()

        f.close()
        private_key = RSA.import_key(private_key_text)
        cipher = PKCS1_OAEP.new(private_key)
        # Hash the input text
        input_hash = hash(input_text)
        print(input_hash)
        sign=encrypt(cipher,input_hash)

        certificate=input_text+f"\nSignature:{sign}"
        #input_text.write(f"\nSignature:{sign}")
        response=jsonify({"certificate": certificate})
        # response.headers.add('Access-Control-Allow-Origin', '*')  # Allow requests from all origins
        # response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000, ssl_context=('/etc/nginx/ssl/myhostname.crt', '/etc/nginx/ssl/myhostname.key'))

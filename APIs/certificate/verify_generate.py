from flask import Flask, request, jsonify
from flask_cors import CORS
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
import hashlib

app = Flask(__name__)
CORS(app)

@app.route('/v', methods=['POST'])
def verify_certificate():

    certificate_data = request.files['certificate_data']
    certificate_data=certificate_data.read()
    certificate_data=certificate_data.decode("utf-8")
    certificate_data=certificate_data.split("\r\n")
    text=certificate_data
    print(certificate_data)
    text=text[:-1]
    sign=certificate_data[-1]
    sign=sign.split(":")[1]
    signature=sign
    a=""
    for i in text:
        a+=i+'\n'
    text=a.rstrip('\n')

    def hash(text):
        hash_obj = hashlib.sha256()
        hash_obj.update(text.encode())
        hash_hex = hash_obj.hexdigest()
        return hash_hex
    print(text)
    h = hash(text)
    print(f"Orginal hash:{h}")
    def decrypt(signature_bytes):
        p=certificate_data
        p = p[3:-1]
        a = ""
        for i in p:
            a += i+"\n"
        public_key_text = a
        print(public_key_text)
        
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
        hash_obj.update(text)
        return hash_obj.digest()
    except Exception as e:
        print(e)
def encrypt(cipher,text):
    try:
        # text_bytes = bytes.fromhex(text)
        # text=text_bytes.decode("utf-8")
        encrypted_hash = cipher.encrypt(text)
        print(encrypted_hash)
        #encrypted_hash=encrypted_hash.decode("utf-8")
        return encrypted_hash.hex()
    except Exception as e:
        print(e)

@app.route('/g', methods=['POST'])
def generate_certificate():
    try:
        private_key_file = request.files['private_key']
        input_file = request.files['input_text']
        input_text=input_file.read()
        # Load the private key
        private_key_text = private_key_file.read().decode("utf-8")
        private_key = RSA.import_key(private_key_text)
        cipher = PKCS1_OAEP.new(private_key)
        # Hash the input text
        input_hash = hash(input_text)
        sign=encrypt(cipher,input_hash)
        certificate=input_text.decode("utf-8")+f"\nSignature:{sign}"
        #input_text.write(f"\nSignature:{sign}")
        print(certificate)
        response=jsonify({"certificate": certificate})
        # response.headers.add('Access-Control-Allow-Origin', '*')  # Allow requests from all origins
        # response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)

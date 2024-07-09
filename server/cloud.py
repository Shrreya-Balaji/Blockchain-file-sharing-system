from flask import Flask, request, jsonify
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding, hashes
from flask_cors import CORS
from io import BytesIO
import secrets
import boto3
import json

app = Flask(__name__)
CORS(app)

# AWS credentials (replace with your actual credentials)


s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

def generate_hash(data):
    digest = hashes.Hash(hashes.SHA256(), backend=default_backend())
    digest.update(data)
    return digest.finalize()

def encrypt_text(text, key):
    cipher = Cipher(algorithms.AES(key), modes.ECB(), backend=default_backend())
    encryptor = cipher.encryptor()
    padder = padding.PKCS7(algorithms.AES.block_size).padder()
    padded_data = padder.update(text) + padder.finalize()
    return encryptor.update(padded_data) + encryptor.finalize()

def decrypt_text(ciphertext, key):
    cipher = Cipher(algorithms.AES(key), modes.ECB(), backend=default_backend())
    decryptor = cipher.decryptor()
    unpadder = padding.PKCS7(algorithms.AES.block_size).unpadder()
    decrypted_data = decryptor.update(ciphertext) + decryptor.finalize()
    return unpadder.update(decrypted_data) + unpadder.finalize()

def divide_into_chunks(file_stream, chunk_size):
    while True:
        chunk = file_stream.read(chunk_size)
        if not chunk:
            break
        padded_chunk = chunk.ljust(chunk_size, b'\x00')  # Pad the chunk to the fixed size
        yield padded_chunk

# ... (other imports and configurations)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    uploaded_file = request.files['file']
    if uploaded_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    key = secrets.token_bytes(16)
    chunk_size = 1024
    uploaded_hashes = []  # Store uploaded chunk hashes

    file_stream = BytesIO()  # Use BytesIO to read file into memory
    uploaded_file.save(file_stream)
    file_stream.seek(0)

    for chunk in divide_into_chunks(file_stream, chunk_size):
        chunk_hash = generate_hash(chunk)
        encrypted = encrypt_text(chunk, key)

        # Upload encrypted chunk to S3 using chunk hash as key
        s3_client.put_object(Body=encrypted, Bucket=BUCKET_NAME, Key=chunk_hash.hex())

        # Store uploaded chunk hashes
        uploaded_hashes.append(chunk_hash.hex())

    return jsonify({'key': key.hex(), 's3ObjectHashes': uploaded_hashes}), 200


@app.route('/decrypt', methods=['POST'])
def decrypt_data():
    data = request.json
    s3_object_hashes = data.get('chunkHashes')
    user_key = bytes.fromhex(data.get('userKey'))

    decrypted_chunks = []

    for chunk_hash in s3_object_hashes:
        # Retrieve encrypted chunk from S3 using hash as key
        encrypted_data = s3_client.get_object(Bucket=BUCKET_NAME, Key=chunk_hash)['Body'].read()

        decrypted_chunk = decrypt_text(encrypted_data, user_key)  # Implement decryption method here
        decrypted_chunks.append(decrypted_chunk)

    # Merge the decrypted chunks
    merged_decrypted = b"".join(decrypted_chunks)
    return merged_decrypted.decode().rstrip('\x00'), 200

@app.route('/send-notification', methods=['POST'])
def send_notification():
    data = request.json
    recipient_address = data.get('recipientAddress')
    msg=data.get('message')
    print('Notification sent to recipient:', recipient_address)
    print('Notification Message', msg)
    return jsonify({'message': 'Notification sent to recipient'}), 200

if __name__ == '__main__':
    app.run(debug=True) 
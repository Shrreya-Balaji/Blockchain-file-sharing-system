from flask import Flask, request, jsonify
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding, hashes
from flask_cors import CORS
from flask import send_file
from io import BytesIO
import secrets
import os

app = Flask(__name__)
CORS(app, origins='http://localhost:3000')

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

def merge_chunks(encrypted_chunks, hashes):
    chunk_hashes = {chunk_hash: encrypted_chunk for encrypted_chunk, chunk_hash in encrypted_chunks}
    merged_encrypted = b"".join(chunk_hashes[hash_val] for hash_val in hashes)
    return merged_encrypted

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    uploaded_file = request.files['file']
    if uploaded_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    key = secrets.token_bytes(16)
    chunk_size = 1024
    encrypted_chunks = []

    file_stream = BytesIO()  # Use BytesIO to read file into memory
    uploaded_file.save(file_stream)
    file_stream.seek(0)  # Reset file pointer to start

    for chunk in divide_into_chunks(file_stream, chunk_size):  # Read chunks from BytesIO stream
        chunk_hash = generate_hash(chunk)
        encrypted = encrypt_text(chunk, key)
        encrypted_chunks.append((encrypted, chunk_hash))

    hashes = [chunk_hash for _, chunk_hash in encrypted_chunks]
    merged_encrypted = merge_chunks(encrypted_chunks, hashes)

    return jsonify({'key': key.hex(), 'encryptedData': merged_encrypted.hex()}), 200


@app.route('/decrypt', methods=['POST'])
def decrypt_data():
    data = request.json
    encrypted_data = bytes.fromhex(data.get('encryptedData'))
    user_key = bytes.fromhex(data.get('userKey'))

    decrypted = decrypt_text(encrypted_data, user_key)
    return decrypted, 200


if __name__ == '__main__':
    app.run(debug=True)

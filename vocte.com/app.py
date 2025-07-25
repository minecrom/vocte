import os
import io
from flask import Flask, request, send_file, render_template, abort
from PIL import Image

app = Flask(__name__)

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/convert', methods=['POST'])
def convert():
    files = request.files.getlist('pngfile')
    if not files:
        abort(400, description="Aucun fichier envoyé.")

    outputs = []
    for uploaded in files:
        filename = uploaded.filename.lower()
        if not filename.endswith('.png'):
            abort(400, description=f"Fichier non supporté : {uploaded.filename}")
        try:
            img = Image.open(uploaded.stream).convert('RGBA')
        except Exception as e:
            abort(400, description=f"Erreur de lecture de l'image {uploaded.filename}: {e}")
        buf = io.BytesIO()
        img.save(buf, format='WEBP')
        buf.seek(0)
        outputs.append((uploaded.filename, buf))

    if len(outputs) == 1:
        name, buf = outputs[0]
        webp_name = name.rsplit('.', 1)[0] + '.webp'
        return send_file(
            buf,
            mimetype='image/webp',
            as_attachment=True,
            download_name=webp_name
        )

    return {
        'files': [
            orig.rsplit('.', 1)[0] + '.webp'
            for orig, _ in outputs
        ]
    }

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_ENV', '').lower() == 'development'
    app.run(host='0.0.0.0', debug=debug_mode)

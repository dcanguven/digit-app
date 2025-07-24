from flask import Flask, render_template, request, jsonify
import numpy as np
import tensorflow as tf
from PIL import Image
import base64
from io import BytesIO

app = Flask(__name__)
print("Flask app initialized")

model = tf.keras.models.load_model("digit_model.h5")
print("Model loaded")

@app.route("/")
def index():
    print("Route '/' accessed")
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    print("POST request received at /predict")
    data = request.get_json()
    if "image" not in data:
        print("Error: No image key in received data")
        return jsonify({"error": "No image data received"}), 400

    try:
        image_data = data["image"].split(",")[1]
        print("Image data extracted")

        image = Image.open(BytesIO(base64.b64decode(image_data))).convert("L")
        print("Image decoded and converted to grayscale")

        image = image.resize((28, 28))
        print("Image resized to 28x28")

        image_array = np.array(image).astype("float32") / 255.0
        print("Image converted to normalized array")

        image_array = 1.0 - image_array
        print("Image inverted")

        image_array = image_array.reshape(1, 28, 28, 1)
        print("Image reshaped to model input format")
        print("Image array summary:", np.min(image_array), np.max(image_array), np.mean(image_array))
        print("Image reshaped to model input format")

        prediction = model.predict(image_array, verbose=0)
        predicted_digit = int(np.argmax(prediction))
        confidence = float(np.max(prediction))

        print(f"Prediction complete – Digit: {predicted_digit}, Confidence: {confidence:.4f}")
        return jsonify({"prediction": predicted_digit, "confidence": f"{confidence:.2%}"})

    except Exception as e:
        print("Prediction error:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
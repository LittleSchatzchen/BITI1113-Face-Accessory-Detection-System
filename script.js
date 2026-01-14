// 🔴 PASTE LINK MODEL TEACHABLE MACHINE ANDA
const URL = "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_URL/";

let model, webcam;

// Load model
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
}
init();

// Start camera
async function initWebcam() {
    const flip = true;
    webcam = new tmImage.Webcam(400, 300, flip);
    await webcam.setup();
    await webcam.play();
    document.getElementById("webcam").replaceWith(webcam.canvas);
    window.requestAnimationFrame(loop);
}

async function loop() {
    webcam.update();
    await predict(webcam.canvas);
    window.requestAnimationFrame(loop);
}

// Upload image
async function handleImageUpload(event) {
    const img = new Image();
    img.src = URL.createObjectURL(event.target.files[0]);
    img.onload = async () => {
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        await predict(canvas);
    };
}

// Predict
async function predict(image) {
    if (!model) return;

    const prediction = await model.predict(image);
    prediction.sort((a, b) => b.probability - a.probability);

    const best = prediction[0];
    document.getElementById("result").innerText =
        `${best.className} (${(best.probability * 100).toFixed(2)}%)`;
}

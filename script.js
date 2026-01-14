// ================================
// Face Accessory Detection System
// Local Teachable Machine Model
// ================================

let model;
let webcam;

// Load model dari folder "model"
async function init() {
    const modelURL = "model/model.json";
    const metadataURL = "model/metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    console.log("Model loaded successfully");
}

init();

// ================================
// Start Webcam Detection
// ================================
async function initWebcam() {
    const flip = true; // mirror webcam
    webcam = new tmImage.Webcam(400, 300, flip);

    await webcam.setup(); // request camera access
    await webcam.play();

    // Replace <video> with canvas webcam
    document.getElementById("webcam").replaceWith(webcam.canvas);

    window.requestAnimationFrame(loop);
}

// Webcam loop
async function loop() {
    webcam.update();
    await predict(webcam.canvas);
    window.requestAnimationFrame(loop);
}

// ================================
// Handle Image Upload
// ================================
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        await predict(canvas);
    };
}

// ================================
// Prediction Function
// ================================
async function predict(image) {
    if (!model) return;

    const predictions = await model.predict(image);

    // Sort by highest probability
    predictions.sort((a, b) => b.probability - a.probability);

    const topPrediction = predictions[0];

    // Display result
    document.getElementById("result").innerText =
        `${topPrediction.className} (${(topPrediction.probability * 100).toFixed(2)}%)`;
}

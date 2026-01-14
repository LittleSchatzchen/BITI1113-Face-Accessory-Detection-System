const URL = "./model/";

let model, webcam, labelContainer, maxPredictions;
let currentMode = "webcam";

// Load model
async function loadModel() {
    model = await tmImage.load(
        URL + "model.json",
        URL + "metadata.json"
    );

    maxPredictions = model.getTotalClasses();
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";

    for (let i = 0; i < maxPredictions; i++) {
        const item = document.createElement("div");
        item.className = "prediction-item";

        item.innerHTML = `
            <div class="class-label">
                <span>${model.getClassLabels()[i]}</span>
                <span class="pct-text">0%</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar"></div>
            </div>
        `;
        labelContainer.appendChild(item);
    }
}

// Start webcam
async function initWebcam() {
    if (webcam) await webcam.stop();

    webcam = new tmImage.Webcam(400, 400, true);
    await webcam.setup();
    await webcam.play();

    const container = document.getElementById("webcam-container");
    container.innerHTML = "";
    container.appendChild(webcam.canvas);

    document.getElementById("uploadedImageCanvas").style.display = "none";
    currentMode = "webcam";

    window.requestAnimationFrame(loop);
}

async function loop() {
    if (currentMode === "webcam") {
        webcam.update();
        await predict(webcam.canvas);
        window.requestAnimationFrame(loop);
    }
}

// Image upload
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = async () => {
            const canvas = document.getElementById("uploadedImageCanvas");
            const ctx = canvas.getContext("2d");

            canvas.width = 400;
            canvas.height = 400;
            ctx.drawImage(img, 0, 0, 400, 400);

            canvas.style.display = "block";
            document.getElementById("webcam-container").innerHTML = "";
            currentMode = "image";

            await predict(canvas);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Prediction
async function predict(input) {
    const predictions = await model.predict(input);

    for (let i = 0; i < maxPredictions; i++) {
        const prob = predictions[i].probability;
        const pct = (prob * 100).toFixed(0) + "%";

        const item = labelContainer.childNodes[i];
        item.querySelector(".pct-text").innerText = pct;

        const bar = item.querySelector(".progress-bar");
        bar.style.width = pct;

        if (prob > 0.6) bar.style.backgroundColor = "#10b981";
        else if (prob > 0.3) bar.style.backgroundColor = "#00f2ff";
        else bar.style.backgroundColor = "#ff2d55";
    }
}

window.onload = loadModel;

const URL = "./model/";

let model, webcam, labelContainer, maxPredictions;
let currentMode = 'webcam'; // 'webcam' or 'image'
let uploadedImage = null;

async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        const classDiv = document.createElement("div");
        classDiv.className = "prediction-item";
        const className = document.createElement("span");
        className.className = "class-name";
        const progressBarContainer = document.createElement("div");
        progressBarContainer.className = "progress-bar-container";
        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        const percentage = document.createElement("span");
        percentage.className = "percentage";

        progressBarContainer.appendChild(progressBar);
        classDiv.appendChild(className);
        classDiv.appendChild(percentage);
        classDiv.appendChild(progressBarContainer);
        labelContainer.appendChild(classDiv);
    }
}

async function initWebcam() {
    if (webcam) {
        await webcam.stop();
    }
    document.getElementById("webcam-container").innerHTML = ''; // Clear previous webcam
    document.getElementById("uploadedImageCanvas").style.display = 'none';

    const flip = true;
    webcam = new tmImage.Webcam(400, 400, flip);
    await webcam.setup();
    await webcam.play();
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    currentMode = 'webcam';
    window.requestAnimationFrame(loop); // Start prediction loop for webcam
}

async function loop() {
    if (currentMode === 'webcam' && webcam && webcam.canvas) {
        webcam.update();
        await predict(webcam.canvas);
        window.requestAnimationFrame(loop);
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            uploadedImage = new Image();
            uploadedImage.onload = async () => {
                if (webcam) {
                    await webcam.stop(); // Stop webcam if it's running
                    document.getElementById("webcam-container").innerHTML = ''; // Clear webcam
                }
                const canvas = document.getElementById("uploadedImageCanvas");
                const ctx = canvas.getContext("2d");
                canvas.width = 400; // Set a fixed width
                canvas.height = (uploadedImage.height / uploadedImage.width) * 400; // Maintain aspect ratio
                ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
                canvas.style.display = 'block';
                currentMode = 'image';
                await predict(canvas);
            };
            uploadedImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

async function predict(imageElement) {
    if (!model) {
        await loadModel(); // Ensure model is loaded before predicting
    }
    const prediction = await model.predict(imageElement);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className;
        const probability = prediction[i].probability.toFixed(2);
        const percentage = (prediction[i].probability * 100).toFixed(0) + "%";

        const item = labelContainer.childNodes[i];
        item.querySelector(".class-name").innerHTML = classPrediction;
        item.querySelector(".percentage").innerHTML = percentage;
        item.querySelector(".progress-bar").style.width = percentage;
        item.querySelector(".progress-bar").style.backgroundColor =
            prediction[i].probability > 0.7 ? '#4CAF50' :
            prediction[i].probability > 0.4 ? '#FFC107' : '#F44336'; // Warna progress bar
    }
}

// Initialize model when page loads
window.onload = loadModel;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.lineWidth = 15;
ctx.lineCap = "round";
ctx.strokeStyle = "black";

let drawing = false;

canvas.addEventListener("mousedown", e => {
  drawing = true;
  console.log("Canvas: Mouse down – drawing started");
  draw(e);
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
  ctx.beginPath();
  console.log("Canvas: Mouse up – drawing ended");
});

canvas.addEventListener("mousemove", draw);

function draw(e) {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
  console.log(`Canvas: Drawing at (${x.toFixed(1)}, ${y.toFixed(1)})`);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("result").innerText = "";
  console.log("Canvas: Cleared");
}

function predict() {
  console.log("Predict started");

  const offscreen = document.createElement("canvas");
  offscreen.width = 28;
  offscreen.height = 28;
  const ctxOff = offscreen.getContext("2d");

  ctxOff.fillStyle = "white";
  ctxOff.fillRect(0, 0, 28, 28);
  ctxOff.drawImage(canvas, 0, 0, 28, 28);

  const dataURL = offscreen.toDataURL("image/png");
  console.log("Offscreen canvas created and image downscaled");

  fetch("/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: dataURL })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById("result").innerText =
      `Prediction: ${data.prediction} (Confidence: ${data.confidence})`;
    console.log("Prediction received");
  });
}
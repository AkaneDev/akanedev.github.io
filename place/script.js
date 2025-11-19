const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colorPicker = document.getElementById("colorPicker");
const status = document.getElementById("status");

const API_URL = "https://your-worker.subdomain.workers.dev";

function draw(pixels) {
  pixels.forEach(({ x, y, color }) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  });
}

async function loadCanvas() {
  const res = await fetch(`${API_URL}/canvas`);
  const pixels = await res.json();
  draw(pixels);
}

canvas.addEventListener("click", async (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) * 100 / canvas.clientWidth);
  const y = Math.floor((e.clientY - rect.top) * 100 / canvas.clientHeight);
  const color = colorPicker.value;

  const res = await fetch(`${API_URL}/pixel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ x, y, color })
  });

  if (res.status === 200) {
    status.textContent = "Pixel placed!";
    loadCanvas();
  } else if (res.status === 429) {
    status.textContent = "You're on cooldown!";
  } else {
    status.textContent = "Failed to place pixel.";
  }
});

loadCanvas();
setInterval(loadCanvas, 5000); // refresh every 5s

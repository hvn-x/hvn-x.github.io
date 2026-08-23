const canvas = document.getElementById('star-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initStars();
}

function initStars() {
  stars = [];
  const count = Math.floor((width * height) / 3000);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005
    });
  }
}

let angle = 0;

function drawNebula(x, y, radius, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function render() {
  ctx.clearRect(0, 0, width, height);

  // 1. NEBULAS
  drawNebula(width * 0.2, height * 0.3, 400, 'rgba(255, 90, 0, 0.08)');
  drawNebula(width * 0.8, height * 0.7, 500, 'rgba(180, 40, 0, 0.06)');
  drawNebula(width * 0.5, height * 0.5, 600, 'rgba(100, 20, 120, 0.04)'); // subtle deep space contrast

  // 2. STARS
  for (let star of stars) {
    star.alpha += star.speed;
    if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;

    ctx.fillStyle = `rgba(255, 230, 200, ${Math.abs(star.alpha)})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. BLACK HOLE (Top Right Corner area)
  const bhX = width * 0.85;
  const bhY = height * 0.25;
  angle += 0.01;

  // Accretion Disk Glow
  ctx.save();
  ctx.translate(bhX, bhY);
  ctx.rotate(angle);
  
  const diskGrad = ctx.createRadialGradient(0, 0, 25, 0, 0, 110);
  diskGrad.addColorStop(0, 'rgba(255, 200, 100, 0.9)');
  diskGrad.addColorStop(0.3, 'rgba(255, 100, 0, 0.5)');
  diskGrad.addColorStop(0.7, 'rgba(180, 30, 0, 0.2)');
  diskGrad.addColorStop(1, 'transparent');

  ctx.fillStyle = diskGrad;
  ctx.scale(1, 0.35); // Squish into an elliptical ring
  ctx.beginPath();
  ctx.arc(0, 0, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Event Horizon (The Black Center)
  const holeGrad = ctx.createRadialGradient(bhX, bhY, 15, bhX, bhY, 28);
  holeGrad.addColorStop(0, '#000000');
  holeGrad.addColorStop(0.8, '#000000');
  holeGrad.addColorStop(1, 'rgba(255, 120, 0, 0.8)');

  ctx.fillStyle = holeGrad;
  ctx.beginPath();
  ctx.arc(bhX, bhY, 28, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(render);
}

window.addEventListener('resize', resize);
resize();
render();

const canvas = document.getElementById('star-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let angle = 0;

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
  drawNebula(width * 0.5, height * 0.5, 600, 'rgba(100, 20, 120, 0.04)');

  // 2. STARS
  for (let star of stars) {
    star.alpha += star.speed;
    if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;

    ctx.fillStyle = `rgba(255, 230, 200, ${Math.abs(star.alpha)})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. UPGRADED BLACK HOLE
  const bhX = width * 0.88;
  const bhY = height * 0.28;
  const coreRadius = 38;
  angle += 0.012;

  // Outer Gravitational Lensing Glow
  const outerGlow = ctx.createRadialGradient(bhX, bhY, coreRadius, bhX, bhY, 180);
  outerGlow.addColorStop(0, 'rgba(255, 120, 0, 0.4)');
  outerGlow.addColorStop(0.3, 'rgba(255, 60, 0, 0.15)');
  outerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(bhX, bhY, 180, 0, Math.PI * 2);
  ctx.fill();

  // Swirling Accretion Disk Ring
  ctx.save();
  ctx.translate(bhX, bhY);
  ctx.rotate(angle);

  const diskGrad = ctx.createRadialGradient(0, 0, coreRadius * 0.8, 0, 0, 140);
  diskGrad.addColorStop(0, '#ffffff');
  diskGrad.addColorStop(0.2, '#ffaa00');
  diskGrad.addColorStop(0.5, '#ff4500');
  diskGrad.addColorStop(0.8, 'rgba(180, 20, 0, 0.3)');
  diskGrad.addColorStop(1, 'transparent');

  ctx.fillStyle = diskGrad;
  ctx.scale(1, 0.28);
  ctx.beginPath();
  ctx.arc(0, 0, 140, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Photon Ring (Bright inner rim)
  const photonRing = ctx.createRadialGradient(bhX, bhY, coreRadius - 2, bhX, bhY, coreRadius + 8);
  photonRing.addColorStop(0, '#ffffff');
  photonRing.addColorStop(0.5, '#ff9900');
  photonRing.addColorStop(1, 'transparent');
  ctx.fillStyle = photonRing;
  ctx.beginPath();
  ctx.arc(bhX, bhY, coreRadius + 8, 0, Math.PI * 2);
  ctx.fill();

  // Pitch Black Event Horizon Center
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(bhX, bhY, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(render);
}

window.addEventListener('resize', resize);
resize();
render();

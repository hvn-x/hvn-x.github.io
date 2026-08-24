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

// WARPED NEBULA FUNCTION (Asymmetrical cosmic clouds)
function drawWarpedNebula(x, y, radius, color, scaleX = 1.5, scaleY = 0.8, rotation = 0.2) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scaleX, scaleY);

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.5, color.replace(/[\d\.]+\)$/, '0.03)')); // Soft mid-fade
  gradient.addColorStop(1, 'transparent');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, width, height);

  // 1. NEBULAS (Warped atmospheric gas clouds)
  // Dusty orange cloud (Top Left)
  drawWarpedNebula(width * 0.15, height * 0.25, 450, 'rgba(255, 90, 0, 0.07)', 1.8, 0.6, -0.4);
  
  // Crimson cloud around black hole area (Top Right)
  drawWarpedNebula(width * 0.85, height * 0.3, 500, 'rgba(200, 30, 10, 0.06)', 1.2, 0.9, 0.5);
  
  // Subtle deep void (Bottom Center)
  drawWarpedNebula(width * 0.5, height * 0.65, 600, 'rgba(90, 15, 110, 0.04)', 1.6, 0.7, -0.2);

  // 2. STARS
  for (let star of stars) {
    star.alpha += star.speed;
    if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;

    ctx.fillStyle = `rgba(255, 230, 200, ${Math.abs(star.alpha)})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. ACCRETION BLACK HOLE
  const bhX = width * 0.88;
  const bhY = height * 0.28;
  const coreRadius = 32;

  // Initialize particles once
  if (!window.bhParticles) {
    window.bhParticles = [];
    for (let i = 0; i < 35; i++) {
      window.bhParticles.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * 70 + coreRadius + 10,
        speed: Math.random() * 0.02 + 0.008,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? '#ffaa00' : '#ff4500'
      });
    }
  }

  // 3a. Far Ambient Glow
  const outerGlow = ctx.createRadialGradient(bhX, bhY, coreRadius, bhX, bhY, 150);
  outerGlow.addColorStop(0, 'rgba(255, 100, 0, 0.25)');
  outerGlow.addColorStop(0.5, 'rgba(255, 40, 0, 0.08)');
  outerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(bhX, bhY, 150, 0, Math.PI * 2);
  ctx.fill();

  // 3b. Main Accretion Ring (Background Glow)
  const ringGrad = ctx.createRadialGradient(bhX, bhY, coreRadius, bhX, bhY, 110);
  ringGrad.addColorStop(0, '#ffaa00');
  ringGrad.addColorStop(0.3, '#ff5500');
  ringGrad.addColorStop(0.7, 'rgba(200, 30, 0, 0.25)');
  ringGrad.addColorStop(1, 'transparent');

  ctx.save();
  ctx.fillStyle = ringGrad;
  ctx.translate(bhX, bhY);
  ctx.scale(1, 0.28);
  ctx.beginPath();
  ctx.arc(0, 0, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Update positions for all particles
  for (let p of window.bhParticles) {
    p.angle += p.speed;
    p.dist -= 0.12;
    if (p.dist < coreRadius + 2) p.dist = Math.random() * 70 + coreRadius + 15;
    p.x = bhX + Math.cos(p.angle) * p.dist;
    p.y = bhY + Math.sin(p.angle) * (p.dist * 0.28);
  }

  // 3c. Draw BACK particles (behind event horizon)
  for (let p of window.bhParticles) {
    if (p.y < bhY) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3d. Solid Pitch Black Event Horizon Center
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(bhX, bhY, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  // 3e. Thin Outer Rim Glow
  ctx.strokeStyle = '#ffaa00';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ff5500';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(bhX, bhY, coreRadius + 1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0; // Reset blur

  // 3f. Draw FRONT particles (in front of event horizon)
  for (let p of window.bhParticles) {
    if (p.y >= bhY) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  requestAnimationFrame(render);
}

window.addEventListener('resize', resize);
resize();
render();

import { useEffect, useRef } from "react";

export default function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Particle types: sparkles, confetti, stars
    const particles = [];
    const GOLD = [201, 168, 76];
    const BLUE = [34, 65, 160];
    const WHITE = [240, 233, 214];

    const randomColor = () => {
      const r = Math.random();
      if (r < 0.6) return GOLD;
      if (r < 0.8) return BLUE;
      return WHITE;
    };

    class Particle {
      constructor() { this.reset(true); }

      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
        this.size = Math.random() * 3 + 0.5;
        this.speedY = -(Math.random() * 0.6 + 0.2);
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.55 + 0.15;
        this.fadeIn = true;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.03;
        this.color = randomColor();
        this.type = Math.random() < 0.5 ? "circle" : "diamond";
        this.twinkleSpeed = Math.random() * 0.03 + 0.01;
        this.twinkleOffset = Math.random() * Math.PI * 2;
        this.age = 0;
      }

      update() {
        this.age++;
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotSpeed;

        // Twinkle
        const twinkle = Math.sin(this.age * this.twinkleSpeed + this.twinkleOffset);

        if (this.fadeIn) {
          this.opacity += 0.008;
          if (this.opacity >= this.maxOpacity) this.fadeIn = false;
        } else {
          this.opacity = this.maxOpacity * (0.7 + 0.3 * twinkle);
        }

        if (this.y < -20 || this.opacity < 0) this.reset();
      }

      draw() {
        const [r, g, b] = this.color;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.type === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},1)`;
          ctx.fill();
          // Glow
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 3);
          grad.addColorStop(0, `rgba(${r},${g},${b},0.3)`);
          grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.beginPath();
          ctx.arc(0, 0, this.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        } else {
          // Diamond shape
          const s = this.size * 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.6, 0);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.6, 0);
          ctx.closePath();
          ctx.fillStyle = `rgba(${r},${g},${b},1)`;
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Shooting star
    class ShootingStar {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height * 0.5;
        this.len = Math.random() * 80 + 40;
        this.speed = Math.random() * 8 + 4;
        this.opacity = 0;
        this.active = false;
        this.delay = Math.random() * 300 + 100;
        this.timer = 0;
        this.angle = Math.PI / 6 + Math.random() * Math.PI / 8;
      }
      update() {
        this.timer++;
        if (this.timer < this.delay) return;
        if (!this.active) { this.active = true; this.opacity = 0.8; }
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.opacity -= 0.025;
        if (this.opacity <= 0) this.reset();
      }
      draw() {
        if (!this.active || this.opacity <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        const grad = ctx.createLinearGradient(
          this.x, this.y,
          this.x - Math.cos(this.angle) * this.len,
          this.y - Math.sin(this.angle) * this.len
        );
        grad.addColorStop(0, `rgba(201,168,76,${this.opacity})`);
        grad.addColorStop(1, "rgba(201,168,76,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - Math.cos(this.angle) * this.len, this.y - Math.sin(this.angle) * this.len);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Init particles
    for (let i = 0; i < 90; i++) particles.push(new Particle());
    const stars = [new ShootingStar(), new ShootingStar(), new ShootingStar()];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      stars.forEach(s => { s.update(); s.draw(); });
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} id="particles-canvas" />;
}

import React, { useEffect } from 'react';

const TubesCursor = () => {
  useEffect(() => {
    const canvas = document.getElementById('tubes-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let mouse = { x: width/2, y: height/2 };
    let lines = [];
    const maxLines = 20;

    class Line {
      constructor() {
        this.x = mouse.x;
        this.y = mouse.y;
        this.history = [{x: this.x, y: this.y}];
        this.maxLength = Math.random() * 20 + 10;
        this.speed = Math.random() * 0.15 + 0.05;
        this.angle = Math.random() * Math.PI * 2;
      }
      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        this.angle = Math.atan2(dy, dx);
        
        this.x += Math.cos(this.angle) * (dx * this.speed);
        this.y += Math.sin(this.angle) * (dy * this.speed);

        this.history.push({x: this.x, y: this.y});
        if (this.history.length > this.maxLength) {
          this.history.shift();
        }
      }
      draw() {
        ctx.beginPath();
        for (let i = 0; i < this.history.length; i++) {
          const pt = this.history[i];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = `rgba(15, 98, 254, ${this.history.length / this.maxLength})`;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    }

    for (let i = 0; i < maxLines; i++) lines.push(new Line());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      lines.forEach(line => {
        line.update();
        line.draw();
      });
      requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas id="tubes-canvas" className="tubes-cursor"></canvas>;
};

export default TubesCursor;

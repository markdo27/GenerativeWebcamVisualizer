import React, { useRef, useEffect } from 'react';
import { VisualizerParams } from '../types';

interface VisualizerProps {
  videoElement: HTMLVideoElement;
  params: VisualizerParams;
}

class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  maxSpeed: number;

  constructor(x: number, y: number, color: string, speed: number) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 1.5 + 1;
    this.maxSpeed = speed;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
    this.color = color;
  }

  update(speed: number) {
    this.maxSpeed = speed;
    this.x += this.speedX * this.maxSpeed;
    this.y += this.speedY * this.maxSpeed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const Visualizer: React.FC<VisualizerProps> = ({ videoElement, params }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const particlesArray = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    // Off-screen canvas for video analysis to improve performance
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
    if (!offscreenCtx) return;

    let mappedImage: { brightness: number; color: string }[][] = [];
    
    const setCanvasSize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      offscreenCanvas.width = videoElement.videoWidth;
      offscreenCanvas.height = videoElement.videoHeight;
      particlesArray.current = [];
      mappedImage = [];
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    const animate = () => {
      // 1. WEBCAM ANALYSIS (using off-screen canvas)
      offscreenCtx.drawImage(videoElement, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
      const pixels = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
      
      mappedImage = [];
      for (let y = 0; y < pixels.height; y += params.resolution) {
        let row: { brightness: number; color: string }[] = [];
        for (let x = 0; x < pixels.width; x += params.resolution) {
          const index = (y * pixels.width + x) * 4;
          const red = pixels.data[index];
          const green = pixels.data[index + 1];
          const blue = pixels.data[index + 2];
          const brightness = (red + green + blue) / 3;
          row.push({
            brightness: brightness,
            color: `rgb(${red},${green},${blue})`
          });
        }
        mappedImage.push(row);
      }

      // 2. FEEDBACK PASS
      ctx.save();
      ctx.globalAlpha = params.feedbackAmount;
      // Center transformations for scale and rotate
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(params.feedbackRotate);
      ctx.scale(params.feedbackScale, params.feedbackScale);
      ctx.translate(params.feedbackTranslateX, params.feedbackTranslateY);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
      ctx.restore();
      
      // 3. MAIN RENDER PASS (Mirrored)
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      
      if (params.showVideo) {
          ctx.globalAlpha = 0.2; // Dim background video
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      }
      
      ctx.globalAlpha = 1;

      // Particle generation logic
      const newParticlesNeeded = params.particleCount - particlesArray.current.length;
      let addedParticles = 0;

      if (newParticlesNeeded > 0) {
        for (let i = 0; i < 200; i++) { // Try to add a batch of particles per frame
            if (addedParticles >= newParticlesNeeded) break;
            const y = Math.floor(Math.random() * mappedImage.length);
            if (!mappedImage[y]) continue;
            const x = Math.floor(Math.random() * mappedImage[y].length);
            const cell = mappedImage[y][x];

            if (cell && cell.brightness > params.brightnessThreshold) {
                const positionX = (x * params.resolution * canvas.width) / pixels.width;
                const positionY = (y * params.resolution * canvas.height) / pixels.height;
                particlesArray.current.push(new Particle(positionX, positionY, cell.color, params.particleSpeed));
                addedParticles++;
            }
        }
      } else if (newParticlesNeeded < 0) {
        particlesArray.current.splice(0, -newParticlesNeeded);
      }

      // Update and draw particles
      particlesArray.current.forEach((p, index) => {
        p.update(params.particleSpeed);
        p.draw(ctx);
        if(p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height){
          particlesArray.current.splice(index, 1);
        }
      });
      
      ctx.restore();

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [videoElement, params]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};
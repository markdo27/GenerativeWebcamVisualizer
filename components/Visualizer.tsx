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
  const hue = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    // Off-screen canvas for video analysis
    const analysisCanvas = document.createElement('canvas');
    const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
    if (!analysisCtx) return;

    // Off-screen canvas for rendering before post-processing
    const renderCanvas = document.createElement('canvas');
    const renderCtx = renderCanvas.getContext('2d', { willReadFrequently: true });
    if (!renderCtx) return;


    let mappedImage: { brightness: number; color: string }[][] = [];
    
    const setCanvasSize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      renderCanvas.width = canvas.width;
      renderCanvas.height = canvas.height;
      analysisCanvas.width = videoElement.videoWidth;
      analysisCanvas.height = videoElement.videoHeight;
      particlesArray.current = [];
      mappedImage = [];
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    const animate = () => {
      // 1. WEBCAM ANALYSIS (using analysis canvas)
      analysisCtx.drawImage(videoElement, 0, 0, analysisCanvas.width, analysisCanvas.height);
      const pixels = analysisCtx.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height);
      
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

      // 2. FEEDBACK PASS on the render canvas
      renderCtx.save();
      renderCtx.globalAlpha = params.feedbackAmount;
      renderCtx.translate(renderCanvas.width / 2, renderCanvas.height / 2);
      renderCtx.rotate(params.feedbackRotate);
      renderCtx.scale(params.feedbackScale, params.feedbackScale);
      renderCtx.translate(params.feedbackTranslateX, params.feedbackTranslateY);
      renderCtx.translate(-renderCanvas.width / 2, -renderCanvas.height / 2);
      renderCtx.drawImage(renderCanvas, 0, 0, renderCanvas.width, renderCanvas.height);
      renderCtx.restore();
      
      // 3. MAIN RENDER PASS (Mirrored) onto the render canvas
      renderCtx.save();
      renderCtx.translate(renderCanvas.width, 0);
      renderCtx.scale(-1, 1);
      
      if (params.showVideo) {
          renderCtx.globalAlpha = 0.2; // Dim background video
          renderCtx.drawImage(videoElement, 0, 0, renderCanvas.width, renderCanvas.height);
      }
      
      renderCtx.globalAlpha = 1;

      // Update hue for rainbow mode
      hue.current = (hue.current + 0.5) % 360;

      // Particle generation logic
      const newParticlesNeeded = params.particleCount - particlesArray.current.length;
      let addedParticles = 0;

      if (newParticlesNeeded > 0) {
        for (let i = 0; i < 200; i++) { 
            if (addedParticles >= newParticlesNeeded) break;
            const y = Math.floor(Math.random() * mappedImage.length);
            if (!mappedImage[y]) continue;
            const x = Math.floor(Math.random() * mappedImage[y].length);
            const cell = mappedImage[y][x];

            if (cell && cell.brightness > params.brightnessThreshold) {
                const positionX = (x * params.resolution * renderCanvas.width) / pixels.width;
                const positionY = (y * params.resolution * renderCanvas.height) / pixels.height;
                
                let color = '#06b6d4'; // Default to monochrome
                switch (params.colorMode) {
                    case 'source':
                        color = cell.color;
                        break;
                    case 'rainbow':
                        color = `hsl(${hue.current}, 100%, 70%)`;
                        break;
                }

                particlesArray.current.push(new Particle(positionX, positionY, color, params.particleSpeed));
                addedParticles++;
            }
        }
      } else if (newParticlesNeeded < 0) {
        particlesArray.current.splice(0, -newParticlesNeeded);
      }

      // Update and draw particles
      particlesArray.current.forEach((p, index) => {
        p.update(params.particleSpeed);
        p.draw(renderCtx);
        if(p.x < 0 || p.x > renderCanvas.width || p.y < 0 || p.y > renderCanvas.height){
          particlesArray.current.splice(index, 1);
        }
      });
      
      renderCtx.restore();

      // 4. KALEIDOSCOPE POST-PROCESSING PASS from render canvas to main canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (params.kaleidoscopeSlices <= 1) {
          ctx.drawImage(renderCanvas, 0, 0);
      } else {
          const slices = Math.floor(params.kaleidoscopeSlices);
          const sliceAngle = (Math.PI * 2) / slices;
          
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          
          for (let i = 0; i < slices; i++) {
              ctx.save();
              ctx.rotate(i * sliceAngle);
              if (i % 2 === 1) {
                  ctx.scale(1, -1);
              }
              
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.arc(0, 0, canvas.width * 1.5, -sliceAngle / 2, sliceAngle / 2);
              ctx.closePath();
              ctx.clip();
              
              ctx.drawImage(renderCanvas, -canvas.width / 2, -canvas.height / 2);
              ctx.restore();
          }
          ctx.restore();
      }

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

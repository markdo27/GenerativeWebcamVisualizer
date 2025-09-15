import React, { useRef, useEffect } from 'react';
import { Layer, CompositionParams } from '../types';

interface VisualizerProps {
  videoElement: HTMLVideoElement;
  layers: Layer[];
  compositionParams: CompositionParams;
  analyser: AnalyserNode | null;
}

class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;

  constructor(x: number, y: number, color: string, size: number) {
    this.x = x;
    this.y = y;
    this.size = Math.max(0.5, size);
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
    this.color = color;
  }

  update(speed: number) {
    this.x += this.speedX * speed;
    this.y += this.speedY * speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const Visualizer: React.FC<VisualizerProps> = ({ videoElement, layers, compositionParams, analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  
  // State per layer
  const layerParticles = useRef(new Map<string, Particle[]>());
  const layerHues = useRef(new Map<string, number>());
  const layerRenderCanvases = useRef(new Map<string, { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }>());

  const audioDataArray = useRef<Uint8Array | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    if (analyser) {
      audioDataArray.current = new Uint8Array(analyser.frequencyBinCount);
    }
    
    const analysisCanvas = document.createElement('canvas');
    const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
    if (!analysisCtx) return;

    let mappedImage: { brightness: number; color: string }[][] = [];
    
    const setCanvasSize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      analysisCanvas.width = videoElement.videoWidth;
      analysisCanvas.height = videoElement.videoHeight;
      
      // Reset all layer states
      layerParticles.current.clear();
      layerRenderCanvases.current.clear();
      layers.forEach(layer => {
          const renderCanvas = document.createElement('canvas');
          const renderCtx = renderCanvas.getContext('2d', { willReadFrequently: true });
          if (!renderCtx) return;
          renderCanvas.width = canvas.width;
          renderCanvas.height = canvas.height;
          layerRenderCanvases.current.set(layer.id, { canvas: renderCanvas, ctx: renderCtx });
          layerParticles.current.set(layer.id, []);
          layerHues.current.set(layer.id, 0);
      });

      mappedImage = [];
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    const animate = () => {
      // 0. AUDIO & WEBCAM ANALYSIS (Done once per frame)
      let audioAverage = 0;
      if (analyser && audioDataArray.current) {
        analyser.getByteFrequencyData(audioDataArray.current);
        audioAverage = audioDataArray.current.reduce((a, b) => a + b, 0) / audioDataArray.current.length;
      }

      analysisCtx.drawImage(videoElement, 0, 0, analysisCanvas.width, analysisCanvas.height);
      const pixels = analysisCtx.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height);
      
      // We analyze the image based on the most demanding resolution setting across all layers
      const maxResolution = Math.max(2, ...layers.map(l => l.params.resolution));
      mappedImage = [];
      for (let y = 0; y < pixels.height; y += maxResolution) {
        let row: { brightness: number; color: string }[] = [];
        for (let x = 0; x < pixels.width; x += maxResolution) {
          const index = (y * pixels.width + x) * 4;
          const red = pixels.data[index];
          const green = pixels.data[index + 1];
          const blue = pixels.data[index + 2];
          const brightness = (red + green + blue) / 3;
          row.push({ brightness, color: `rgb(${red},${green},${blue})` });
        }
        mappedImage.push(row);
      }
      
      // Clear main canvas for the new frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (compositionParams.showVideo) {
          ctx.save();
          ctx.globalAlpha = 0.2;
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          ctx.restore();
      }

      // RENDER EACH LAYER
      layers.forEach(layer => {
        if (!layer.isVisible) return;
        
        const { params } = layer;
        const renderState = layerRenderCanvases.current.get(layer.id);
        if (!renderState) return; // Should not happen
        
        const { canvas: renderCanvas, ctx: renderCtx } = renderState;
        
        const particles = layerParticles.current.get(layer.id) || [];
        const currentHue = layerHues.current.get(layer.id) || 0;
        
        const normalizedAudio = Math.min(audioAverage / 128, 1.0);
        const audioEffect = normalizedAudio * params.audioIntensity;
        
        // 1. FEEDBACK PASS
        renderCtx.save();
        renderCtx.globalAlpha = params.feedbackAmount;
        renderCtx.translate(renderCanvas.width / 2, renderCanvas.height / 2);
        renderCtx.rotate(params.feedbackRotate);
        const audioScale = params.feedbackScale + (audioEffect * 0.05);
        renderCtx.scale(audioScale, audioScale);
        renderCtx.translate(params.feedbackTranslateX, params.feedbackTranslateY);
        renderCtx.translate(-renderCanvas.width / 2, -renderCanvas.height / 2);
        renderCtx.drawImage(renderCanvas, 0, 0, renderCanvas.width, renderCanvas.height);
        renderCtx.restore();

        // 2. PARTICLE RENDER PASS
        renderCtx.save();
        renderCtx.translate(renderCanvas.width, 0);
        renderCtx.scale(-1, 1);
        renderCtx.globalAlpha = 1;
        
        layerHues.current.set(layer.id, (currentHue + 0.5) % 360);

        const newParticlesNeeded = params.particleCount - particles.length;
        if (newParticlesNeeded > 0) {
            const brightCells: { x: number; y: number; cell: { brightness: number; color: string } }[] = [];
            for (let y = 0; y < mappedImage.length; y++) {
                if (!mappedImage[y]) continue;
                for (let x = 0; x < mappedImage[y].length; x++) {
                    const cell = mappedImage[y][x];
                    if (cell && cell.brightness > params.brightnessThreshold) {
                        brightCells.push({ x, y, cell });
                    }
                }
            }

            if (brightCells.length > 0) {
                for (let i = 0; i < newParticlesNeeded; i++) {
                    const randomCell = brightCells[Math.floor(Math.random() * brightCells.length)];
                    const { x, y, cell } = randomCell;

                    const positionX = (x * maxResolution * renderCanvas.width) / pixels.width;
                    const positionY = (y * maxResolution * renderCanvas.height) / pixels.height;
                    
                    let color = '#06b6d4';
                    switch (params.colorMode) {
                        case 'source': color = cell.color; break;
                        case 'rainbow': color = `hsl(${currentHue}, 100%, 70%)`; break;
                        case 'audio-hue': color = `hsl(${(currentHue + (audioEffect * 360)) % 360}, 100%, 70%)`; break;
                        case 'audio-pulse': color = `hsl(185, 100%, ${50 + (audioEffect * 50)}%)`; break;
                    }
                    const brightnessRange = 255 - params.brightnessThreshold;
                    const normalizedBrightness = Math.max(0, (cell.brightness - params.brightnessThreshold) / (brightnessRange || 1));
                    const baseSize = (normalizedBrightness * 4) + 1;
                    const finalSize = baseSize + (Math.random() - 0.5) * 2 + (audioEffect * 5);
                    particles.push(new Particle(positionX, positionY, color, finalSize));
                }
            }
        } else if (newParticlesNeeded < 0) {
            particles.splice(0, -newParticlesNeeded);
        }

        particles.forEach((p, index) => {
            p.update(params.particleSpeed);
            p.draw(renderCtx);
            if(p.x < 0 || p.x > renderCanvas.width || p.y < 0 || p.y > renderCanvas.height){
                particles.splice(index, 1);
            }
        });
        layerParticles.current.set(layer.id, particles);
        renderCtx.restore();

        // 3. POST-PROCESSING & COMPOSITION
        ctx.save();
        ctx.globalCompositeOperation = layer.blendMode;
        
        const audioHueShift = params.hueShift + (audioEffect * 180);
        ctx.filter = `hue-rotate(${audioHueShift}deg)`;
        
        if (params.kaleidoscopeSlices <= 1) {
            ctx.drawImage(renderCanvas, 0, 0);
        } else {
            const slices = Math.floor(params.kaleidoscopeSlices);
            const sliceAngle = (Math.PI * 2) / slices;
            ctx.translate(canvas.width / 2, canvas.height / 2);
            for (let i = 0; i < slices; i++) {
                ctx.save();
                ctx.rotate(i * sliceAngle);
                if (i % 2 === 1) ctx.scale(1, -1);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, canvas.width * 1.5, -sliceAngle / 2, sliceAngle / 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(renderCanvas, -canvas.width / 2, -canvas.height / 2);
                ctx.restore();
            }
        }
        ctx.restore();
      });

      // 4. FINAL COMPOSITION COLOR TINT
      const { r, g, b } = compositionParams.colorTint;
      if (r < 255 || g < 255 || b < 255) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
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
  }, [videoElement, layers, compositionParams, analyser]);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
};
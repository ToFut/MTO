import React, { useEffect, useRef } from 'react';

const TextureGenerator = () => {
  const canvasRef = useRef(null);
  const leatherRef = useRef(null);
  const denimRef = useRef(null);

  useEffect(() => {
    const createCanvasTexture = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 512;
      
      ctx.fillStyle = '#F5E6D3';
      ctx.fillRect(0, 0, 512, 512);
      
      for (let i = 0; i < 1000; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * 512,
          Math.random() * 512,
          Math.random() * 2,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.03})`;
        ctx.fill();
      }
      
      for (let i = 0; i < 512; i += 4) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.01)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'canvas.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 'image/jpeg');
    };

    const createLeatherTexture = () => {
      const canvas = leatherRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 512;
      
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, 0, 512, 512);
      
      for (let i = 0; i < 500; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = Math.random() * 20 + 10;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random() * 0.1 + 0.05})`;
        ctx.lineWidth = Math.random() * 2 + 1;
        ctx.stroke();
      }
      
      for (let i = 0; i < 2000; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * 512,
          Math.random() * 512,
          Math.random() * 1,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
        ctx.fill();
      }
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'leather.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 'image/jpeg');
    };

    const createDenimTexture = () => {
      const canvas = denimRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 512;
      
      ctx.fillStyle = '#1E3A8A';
      ctx.fillRect(0, 0, 512, 512);
      
      for (let i = 0; i < 512; i += 2) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(512, i);
        ctx.strokeStyle = i % 4 === 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      for (let i = 0; i < 512; i += 2) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 512);
        ctx.strokeStyle = i % 4 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'denim.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 'image/jpeg');
    };

    createCanvasTexture();
    createLeatherTexture();
    createDenimTexture();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Texture Generator</h2>
      <p className="mb-4">Textures will be automatically downloaded</p>
      <div className="flex gap-4">
        <canvas ref={canvasRef} className="border" />
        <canvas ref={leatherRef} className="border" />
        <canvas ref={denimRef} className="border" />
      </div>
    </div>
  );
};

export default TextureGenerator;
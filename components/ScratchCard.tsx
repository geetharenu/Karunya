
import React, { useRef, useEffect, useState } from 'react';

interface ScratchCardProps {
  onComplete: () => void;
  name: string;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ onComplete, name }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);

  // Slider State
  const [sliderX, setSliderX] = useState(0);
  const sliderXRef = useRef(0);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const isDraggingSlider = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      // Only resize if dimensions actually changed to avoid resetting progress on mobile scroll/bar toggle
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width;
          canvas.height = rect.height;
          
          // Fill with scratchable coating
          ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = '#d1d5db'; // gray-300
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add texture/pattern
          ctx.fillStyle = '#9ca3af'; // gray-400
          ctx.font = '20px Arial';
          for(let i=0; i<100; i++) {
            ctx.fillText("🎁", Math.random() * canvas.width, Math.random() * canvas.height);
          }
          
          // Instruction text
          ctx.font = 'bold 24px sans-serif';
          ctx.fillStyle = '#4b5563'; // gray-600
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = "white";
          ctx.shadowBlur = 5;
          ctx.fillText("Scratch to Reveal!", canvas.width / 2, canvas.height / 2);
          ctx.shadowBlur = 0;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    return () => window.removeEventListener('resize', resize);
  }, []);

  const getBrushPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    // Handle both mouse and touch events safely
    if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    } else {
        return { x: 0, y: 0 };
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
      setIsDrawing(true);
      // Determine if we should treat this as a click/tap to scratch a dot immediately
      handleMove(e, true);
  };
  
  const handleEnd = () => setIsDrawing(false);

  const handleMove = (e: React.MouseEvent | React.TouchEvent, force = false) => {
    if (!isDrawing && !force) return;
    
    // Prevent scrolling on touch devices while scratching
    // Note: 'touch-action: none' in CSS usually handles this, but this is a backup
    // e.preventDefault() is tricky with React synthetic events, rely on CSS
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getBrushPos(e);
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, 2 * Math.PI);
    ctx.fill();

    // Throttle check to improve performance
    if (Math.random() > 0.9 || force) {
        checkReveal();
    }
  };

  const checkReveal = () => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    // Small optimization: sample fewer pixels
    const w = canvas.width;
    const h = canvas.height;
    // Get low-res image data for performance
    const imageData = ctx.getImageData(0, 0, w, h);
    const pixels = imageData.data;
    let transparent = 0;
    let total = 0;
    const step = 4 * 100; // Sample every 100th pixel to be fast

    for (let i = 0; i < pixels.length; i += step) {
        total++;
        if (pixels[i+3] < 128) transparent++;
    }
    
    const percent = (transparent / total) * 100;
    setScratchProgress(percent);

    if (percent > 40) {
        setIsRevealed(true);
    }
  };

  // --- Slider Logic ---
  
  const handleSliderDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingSlider.current = true;
    window.addEventListener('mousemove', handleSliderDragMove);
    window.addEventListener('mouseup', handleSliderDragEnd);
    window.addEventListener('touchmove', handleSliderDragMove);
    window.addEventListener('touchend', handleSliderDragEnd);
  };

  const handleSliderDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingSlider.current || !sliderTrackRef.current) return;
    
    const track = sliderTrackRef.current;
    const rect = track.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    
    const thumbWidth = 56;
    const maxVal = rect.width - thumbWidth;
    
    let newVal = clientX - rect.left - (thumbWidth / 2);
    
    if (newVal < 0) newVal = 0;
    if (newVal > maxVal) newVal = maxVal;
    
    sliderXRef.current = newVal;
    setSliderX(newVal);
  };

  const handleSliderDragEnd = () => {
    isDraggingSlider.current = false;
    window.removeEventListener('mousemove', handleSliderDragMove);
    window.removeEventListener('mouseup', handleSliderDragEnd);
    window.removeEventListener('touchmove', handleSliderDragMove);
    window.removeEventListener('touchend', handleSliderDragEnd);
    
    if (!sliderTrackRef.current) return;
    
    const track = sliderTrackRef.current;
    const thumbWidth = 56;
    const maxVal = track.offsetWidth - thumbWidth;

    if (sliderXRef.current > maxVal * 0.6) {
        setSliderX(maxVal);
        sliderXRef.current = maxVal;
        setTimeout(onComplete, 50);
    } else {
        setSliderX(0);
        sliderXRef.current = 0;
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-party-100 overflow-hidden touch-none">
        {/* Hidden Content Layer - ALWAYS VISIBLE underneath the scratchpad */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-white z-0">
            <h2 className="text-xl md:text-2xl text-party-500 font-bold mb-4 animate-bounce-slow">Surprise!</h2>
            <h1 className="text-4xl md:text-6xl font-script text-party-700 mb-8">
                {name}, <br/> It's Your Birthday!
            </h1>
            <p className="text-gray-500 mb-8 max-w-md">May your day be filled with laughter, joy, and lots of cake!</p>
            
            {/* Slider shows up after scratching a bit, or is always there? Let's keep it mostly hidden until reveal to avoid confusion, or show it disabled. 
                Let's reveal it as the user scratches for a cool effect.
            */}
            <div 
              className={`transition-all duration-700 transform ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
            >
              <div 
                ref={sliderTrackRef}
                className={`relative w-72 h-16 rounded-full shadow-inner border border-party-200 select-none overflow-hidden transition-colors duration-300 ${sliderX > 100 ? 'bg-green-50' : 'bg-party-100'}`}
              >
                <div className={`absolute inset-0 flex items-center justify-center font-bold tracking-wider animate-pulse transition-opacity duration-300 ${sliderX > 50 ? 'opacity-0' : 'opacity-100 text-party-400'}`}>
                  Slide to Enter &gt;&gt;
                </div>

                <div className={`absolute inset-0 flex items-center justify-center font-bold tracking-wider text-green-500 transition-opacity duration-300 ${sliderX > 50 ? 'opacity-100' : 'opacity-0'}`}>
                  Almost there!
                </div>
                
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-party-200 to-party-400 opacity-60"
                  style={{ width: `${sliderX + 28}px` }}
                />

                <div 
                  className="absolute top-1 left-1 w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center text-2xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10 touch-none"
                  style={{ transform: `translateX(${sliderX}px)` }}
                  onMouseDown={handleSliderDragStart}
                  onTouchStart={handleSliderDragStart}
                >
                  🎂
                </div>
              </div>
            </div>
        </div>

        {/* Scratch Layer */}
        <div 
            ref={containerRef} 
            className={`absolute inset-0 transition-opacity duration-1000 z-10 ${isRevealed && scratchProgress > 60 ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
            style={{ touchAction: 'none' }} // Crucial for mobile
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full touch-none cursor-crosshair"
                onMouseDown={handleStart}
                onMouseUp={handleEnd}
                onMouseMove={(e) => handleMove(e)}
                onTouchStart={handleStart}
                onTouchEnd={handleEnd}
                onTouchMove={(e) => handleMove(e)}
            />
        </div>
        
        {/* Helper text - Only show when NOT revealed */}
        {!isRevealed && (
             <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none z-20">
                 <p className="text-white bg-black/50 inline-block px-4 py-1 rounded-full text-sm animate-pulse shadow-lg">
                     👆 Scratch the screen to see your message!
                 </p>
             </div>
        )}
    </div>
  );
};


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
  const sliderXRef = useRef(0); // Ref to track value inside event listeners without closure staleness
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
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Fill with scratchable coating
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#d1d5db'; // gray-300
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add texture/pattern
      ctx.fillStyle = '#9ca3af'; // gray-400
      for(let i=0; i<100; i++) {
        ctx.font = `${Math.random() * 20 + 10}px Arial`;
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
    
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleStart = () => setIsDrawing(true);
  
  const handleEnd = () => setIsDrawing(false);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getBrushPos(e);
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, 2 * Math.PI);
    ctx.fill();

    // Throttle check
    if (Math.random() > 0.8) {
        checkReveal();
    }
  };

  const checkReveal = () => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    if(!ctx) return;

    // Sample pixels to determine percentage cleared
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    let checkedPixels = 0;
    const sampleRate = 50;

    for (let i = 0; i < pixels.length; i += 4 * sampleRate) {
        checkedPixels++;
        if (pixels[i+3] < 128) transparent++;
    }
    
    const percent = (transparent / checkedPixels) * 100;
    setScratchProgress(percent);

    if (percent > 40) {
        setIsRevealed(true);
    }
  };

  // --- Slider Logic ---
  
  const handleSliderDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDraggingSlider.current = true;
    // We add listeners to window to handle dragging outside the element
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
    
    // Thumb width is approx 56px (w-14)
    const thumbWidth = 56;
    const maxVal = rect.width - thumbWidth;
    
    let newVal = clientX - rect.left - (thumbWidth / 2);
    
    if (newVal < 0) newVal = 0;
    if (newVal > maxVal) newVal = maxVal;
    
    // Update both ref (logic) and state (render)
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

    // Unlock at 60% distance for better UX
    if (sliderXRef.current > maxVal * 0.6) {
        // Snap to end
        setSliderX(maxVal);
        sliderXRef.current = maxVal;
        
        // Trigger completion immediately
        setTimeout(onComplete, 50);
    } else {
        // Snap back to start
        setSliderX(0);
        sliderXRef.current = 0;
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-party-100 overflow-hidden touch-none">
        {/* Hidden Content Layer */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center animate-pulse-glow bg-white">
            <h2 className="text-xl md:text-2xl text-party-500 font-bold mb-4">Surprise!</h2>
            <h1 className="text-4xl md:text-6xl font-script text-party-700 mb-8 animate-bounce-slow">
                {name}, <br/> It's Your Birthday!
            </h1>
            <p className="text-gray-500 mb-8 max-w-md">May your day be filled with laughter, joy, and lots of cake!</p>
            
            {/* Custom Slider */}
            <div className={`transition-all duration-700 transform ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
              <div 
                ref={sliderTrackRef}
                className={`relative w-72 h-16 rounded-full shadow-inner border border-party-200 select-none overflow-hidden transition-colors duration-300 ${sliderX > 100 ? 'bg-green-50' : 'bg-party-100'}`}
              >
                {/* Background Text */}
                <div className={`absolute inset-0 flex items-center justify-center font-bold tracking-wider animate-pulse transition-opacity duration-300 ${sliderX > 50 ? 'opacity-0' : 'opacity-100 text-party-400'}`}>
                  Slide to Enter &gt;&gt;
                </div>

                <div className={`absolute inset-0 flex items-center justify-center font-bold tracking-wider text-green-500 transition-opacity duration-300 ${sliderX > 50 ? 'opacity-100' : 'opacity-0'}`}>
                  Almost there!
                </div>
                
                {/* Progress Fill */}
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-party-200 to-party-400 opacity-60"
                  style={{ width: `${sliderX + 28}px` }}
                />

                {/* Thumb */}
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
            className={`absolute inset-0 transition-opacity duration-1000 ${isRevealed && scratchProgress > 60 ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        >
            <canvas
                ref={canvasRef}
                className="touch-none cursor-crosshair"
                onMouseDown={handleStart}
                onMouseUp={handleEnd}
                onMouseMove={handleMove}
                onTouchStart={handleStart}
                onTouchEnd={handleEnd}
                onTouchMove={handleMove}
            />
        </div>
        
        {/* Helper text */}
        {!isRevealed && (
             <div className="absolute bottom-10 left-0 w-full text-center pointer-events-none">
                 <p className="text-white bg-black/50 inline-block px-4 py-1 rounded-full text-sm animate-pulse">
                     Scratch the screen to see your message!
                 </p>
             </div>
        )}
    </div>
  );
};

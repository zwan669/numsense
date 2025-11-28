import React, { useRef, useState, useEffect } from 'react';
import { Pen, Eraser, Trash2, Undo, GripHorizontal } from 'lucide-react';

interface ScratchpadProps {
  className?: string;
}

const Scratchpad: React.FC<ScratchpadProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [lineWidth, setLineWidth] = useState(3);
  const [height, setHeight] = useState(320);
  const [isHovering, setIsHovering] = useState(false);
  
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<string[]>([]);
  const isResizingRef = useRef(false);

  // Initialize and Handle Resize with ResizeObserver
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        
        // If dimensions match, skip to avoid unnecessary redraws
        if (canvas.width === width && canvas.height === height) continue;

        // Save current content
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        if (tempCtx) {
            tempCtx.drawImage(canvas, 0, 0);
        }

        // Resize canvas to match container
        canvas.width = width;
        canvas.height = height;

        // Restore content
        const ctx = canvas.getContext('2d');
        if (ctx) {
             ctx.lineCap = 'round';
             ctx.lineJoin = 'round';
             ctx.drawImage(tempCanvas, 0, 0);
        }
      }
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  const saveState = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    historyRef.current.push(dataUrl);
    // Limit history
    if (historyRef.current.length > 20) {
      historyRef.current.shift();
    }
  };

  const handleUndo = () => {
    if (!canvasRef.current || historyRef.current.length === 0) return;
    const previousUrl = historyRef.current.pop();
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx && previousUrl) {
      const img = new Image();
      img.src = previousUrl;
      img.onload = () => {
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        ctx.globalCompositeOperation = 'source-over'; // Reset for image drawing
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    
    let clientX = 0, clientY = 0;
    
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
       clientX = e.changedTouches[0].clientX;
       clientY = e.changedTouches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Custom Cursor Logic
  const updateCursor = (e: React.MouseEvent | React.TouchEvent) => {
    if (!cursorRef.current || !containerRef.current) return;
    
    const pos = getPos(e);
    
    // Check if cursor is within bounds (roughly)
    if (pos.x < 0 || pos.y < 0 || 
        pos.x > containerRef.current.clientWidth || 
        pos.y > containerRef.current.clientHeight) {
        if (isHovering) setIsHovering(false);
        return;
    }

    if (!isHovering) setIsHovering(true);

    // Using translate3d for GPU acceleration
    // translate(-50%, -50%) centers the cursor div on the mouse coordinates
    cursorRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
    cursorRef.current.style.width = `${Math.max(lineWidth, 6)}px`;
    cursorRef.current.style.height = `${Math.max(lineWidth, 6)}px`;
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    // Only prevent default if it's touch to stop scrolling, but allow mouse events
    if ('touches' in e) e.preventDefault(); 
    
    saveState(); // Save state before this stroke

    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
    updateCursor(e);
    
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = tool === 'pen' ? '#334155' : 'rgba(0,0,0,1)'; 
        if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }
        ctx.fill();
        ctx.beginPath(); 
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    updateCursor(e);
    
    if (!isDrawing || !canvasRef.current || !lastPos.current) return;
    if ('touches' in e) e.preventDefault(); 

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const currentPos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    
    ctx.strokeStyle = '#334155'; // Slate-700
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.stroke();
    lastPos.current = currentPos;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    saveState(); // Save state before clearing
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // Resize Handle Logic
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    // Only prevent default for mouse, to avoid text selection. 
    // For touch, we might want to be careful, but generally okay here.
    if (!('touches' in e)) e.preventDefault();
    
    isResizingRef.current = true;
    
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startHeight = height;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
        if (!isResizingRef.current) return;
        const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;
        const delta = currentY - startY;
        const newHeight = Math.max(150, Math.min(800, startHeight + delta));
        setHeight(newHeight);
    };

    const handleEnd = () => {
        isResizingRef.current = false;
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
  };

  return (
    <div className={`flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between p-3 bg-slate-50 border-b border-slate-100 gap-2">
            <div className="flex items-center space-x-2">
                <span className="hidden sm:inline text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">草稿纸</span>
                
                {/* Tools */}
                <div className="flex bg-slate-200 rounded-lg p-1">
                    <button 
                        onClick={() => setTool('pen')}
                        className={`p-1.5 rounded-md transition-all ${tool === 'pen' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        title="画笔"
                    >
                        <Pen className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setTool('eraser')}
                        className={`p-1.5 rounded-md transition-all ${tool === 'eraser' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        title="橡皮擦"
                    >
                        <Eraser className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="h-4 w-px bg-slate-300 mx-1"></div>

                {/* Size Slider */}
                <div className="flex items-center">
                    <input 
                        type="range" 
                        min="2" 
                        max="30" 
                        value={lineWidth} 
                        onChange={(e) => setLineWidth(parseInt(e.target.value))}
                        className="w-20 md:w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        title="粗细调整"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
                 <button 
                    onClick={handleUndo}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-30"
                    title="撤回"
                    disabled={historyRef.current.length === 0}
                >
                    <Undo className="w-4 h-4" />
                </button>
                <button 
                    onClick={clearCanvas}
                    className="flex items-center px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="清空画布"
                >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    清空
                </button>
            </div>
        </div>

        {/* Canvas Area */}
        <div 
          ref={containerRef} 
          className="relative w-full bg-slate-50/30 touch-none select-none overflow-hidden cursor-none"
          style={{ height: `${height}px`, transition: isResizingRef.current ? 'none' : 'height 0.1s' }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 pointer-events-none opacity-10" 
                 style={{ 
                     backgroundImage: 'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)', 
                     backgroundSize: '20px 20px' 
                 }}>
            </div>
            
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="absolute inset-0 block w-full h-full"
                style={{ cursor: 'none' }} // Ensure system cursor is hidden
            />

            {/* Custom Cursor - Using absolute positioning within the relative container */}
            <div 
                ref={cursorRef}
                className="absolute pointer-events-none rounded-full border border-slate-800 z-50"
                style={{ 
                    display: isHovering ? 'block' : 'none',
                    top: 0,
                    left: 0,
                    // Use a white shadow ring for high contrast on dark backgrounds
                    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.9)', 
                    backgroundColor: tool === 'eraser' ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
                    willChange: 'transform, width, height',
                }}
            />
        </div>

        {/* Resize Handle */}
        <div 
            className="h-6 w-full bg-slate-100 border-t border-slate-200 flex items-center justify-center cursor-ns-resize hover:bg-slate-200 transition-colors"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
        >
            <GripHorizontal className="w-4 h-4 text-slate-400" />
        </div>
    </div>
  );
};

export default Scratchpad;
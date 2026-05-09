import { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Image as ImageIcon, Timer, Printer, RefreshCw, HelpCircle, CheckCircle } from 'lucide-react';
import { PUZZLE_ROWS, PUZZLE_COLS, TOTAL_PIECES, DEFAULT_IMAGE } from './constants';
import { PuzzlePiece, AppView } from './types';

export default function App() {
  const [view, setView] = useState<AppView>('intro');
  const [imageUrl, setImageUrl] = useState<string>(DEFAULT_IMAGE);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);

  // Initialize game
  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const initialPieces: PuzzlePiece[] = Array.from({ length: TOTAL_PIECES }, (_, i) => ({
      id: i,
      originalIndex: i,
      currentPos: null,
    }));
    // Shuffle pieces
    const shuffledPieces = [...initialPieces].sort(() => Math.random() - 0.5);
    setPieces(shuffledPieces);
    setTimer(0);
    setIsTimerActive(true);
    setIsGameWon(false);
    setSelectedPieceId(null);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && !isGameWon) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, isGameWon]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageUrl(ev.target?.result as string);
        initGame();
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePieceClick = (pieceId: number) => {
    if (isGameWon) return;
    
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;

    if (selectedPieceId === pieceId) {
      setSelectedPieceId(null);
    } else {
      setSelectedPieceId(pieceId);
    }
  };

  const handleSlotClick = (slotIndex: number) => {
    if (selectedPieceId === null || isGameWon) return;

    const newPieces = pieces.map(p => {
      // If another piece was in this slot, return it to the pool
      if (p.currentPos === slotIndex) {
        return { ...p, currentPos: null };
      }
      // Move selected piece to this slot
      if (p.id === selectedPieceId) {
        return { ...p, currentPos: slotIndex };
      }
      return p;
    });

    setPieces(newPieces);
    setSelectedPieceId(null);
    checkWin(newPieces);
  };

  const checkWin = (currentPieces: PuzzlePiece[]) => {
    const allPlaced = currentPieces.every(p => p.currentPos !== null);
    if (!allPlaced) return;

    const isCorrect = currentPieces.every(p => p.currentPos === p.originalIndex);
    if (isCorrect) {
      setIsGameWon(true);
      setIsTimerActive(false);
      // Wait a bit to show the win before switching view
      setTimeout(() => setView('boarding'), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderView = () => {
    switch (view) {
      case 'intro':
        return (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center min-h-screen text-center px-6 bg-slate-50"
          >
            <div className="max-w-2xl">
              <span className="text-red-500 font-black tracking-[0.3em] uppercase text-sm mb-4 block">Séjour Express</span>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-8">
                Pour deux <span className="text-red-600">mamans</span> formidables,<br />
                un cadeau à la hauteur de leur personne.
              </h1>
              <p className="text-slate-500 text-lg md:text-xl mb-12 font-medium">
                Prêtes pour la prochaine étape de l'aventure ?
              </p>
              <button 
                onClick={() => { setView('puzzle'); }}
                className="bg-red-600 text-white font-black uppercase py-5 px-12 rounded-full text-lg shadow-xl shadow-red-200 hover:scale-105 hover:bg-red-700 transition cursor-pointer"
              >
                Découvrir le défi
              </button>
            </div>
          </motion.div>
        );

      case 'puzzle':
        return (
          <motion.div 
            key="puzzle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-10 px-4 min-h-screen bg-slate-50"
          >
            <header className="text-center mb-8 relative w-full max-w-md">
              <h2 className="text-2xl font-black text-slate-800 uppercase italic mb-6">Le Défi du Puzzle</h2>
              
              <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-2xl text-xs font-bold inline-flex items-center gap-3 transition shadow-sm">
                <ImageIcon size={18} />
                Charger la photo Muriel & Ingrid
                <input type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
              </label>
            </header>

            <div className="flex gap-10 mb-10 font-bold text-slate-600 bg-white px-10 py-4 rounded-full shadow-lg text-sm border border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-red-500" />
                Pièces: <span className="text-red-600">{pieces.filter(p => p.currentPos !== null).length}/{TOTAL_PIECES}</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-red-500" />
                Temps: <span className="text-red-600">{formatTime(timer)}</span>
              </div>
            </div>

            {/* Puzzle Board */}
            <div 
              className="grid gap-1 bg-slate-100 p-2 rounded-2xl border-[6px] border-slate-900 shadow-2xl relative overflow-hidden"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${PUZZLE_COLS}, 1fr)`,
                width: 'min(90vw, 380px)',
                aspectRatio: `${PUZZLE_COLS} / ${PUZZLE_ROWS}`
              }}
            >
              {Array.from({ length: TOTAL_PIECES }).map((_, i) => {
                const pieceInSlot = pieces.find(p => p.currentPos === i);
                return (
                  <div 
                    key={`slot-${i}`}
                    onClick={() => handleSlotClick(i)}
                    className="w-full h-full bg-white/40 rounded-sm border border-dashed border-slate-200 relative overflow-hidden transition hover:bg-white/60 cursor-pointer"
                  >
                    {showHint && !pieceInSlot && (
                       <div className="absolute inset-0 opacity-20 bg-cover bg-no-repeat grayscale"
                          style={{
                            backgroundImage: `url(${imageUrl})`,
                            backgroundSize: `${PUZZLE_COLS * 100}% ${PUZZLE_ROWS * 100}%`,
                            backgroundPosition: `${(i % PUZZLE_COLS) * (100 / (PUZZLE_COLS - 1))}% ${Math.floor(i / PUZZLE_COLS) * (100 / (PUZZLE_ROWS - 1))}%`
                          }}
                       />
                    )}
                    {pieceInSlot && (
                      <PuzzlePieceComponent 
                        piece={pieceInSlot} 
                        imageUrl={imageUrl} 
                        isSelected={selectedPieceId === pieceInSlot.id}
                        onClick={() => handlePieceClick(pieceInSlot.id)}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pieces Pool */}
            <div className="mt-12 w-full max-w-lg bg-white/80 backdrop-blur-xl p-8 rounded-[40px] border border-white shadow-2xl">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[.4em] text-center mb-8">Pièces à placer</h3>
               <div className="flex flex-wrap justify-center gap-4">
                 {pieces.filter(p => p.currentPos === null).map(p => (
                   <div key={`pool-${p.id}`} className="w-20 h-24 md:w-24 md:h-32">
                     <PuzzlePieceComponent 
                        piece={p} 
                        imageUrl={imageUrl} 
                        isSelected={selectedPieceId === p.id}
                        onClick={() => handlePieceClick(p.id)}
                      />
                   </div>
                 ))}
                 {pieces.filter(p => p.currentPos === null).length === 0 && !isGameWon && (
                   <p className="text-slate-400 italic text-sm py-4">Toutes les pièces sont placées ! Vérifiez l'ordre...</p>
                 )}
               </div>
            </div>

            <div className="mt-10 flex gap-10">
              <button onClick={initGame} className="text-slate-400 hover:text-red-500 font-bold flex items-center gap-2 text-sm transition group cursor-pointer">
                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Réinitialiser
              </button>
              <button 
                onClick={() => setShowHint(!showHint)} 
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-xs transition border cursor-pointer ${showHint ? 'bg-red-50 border-red-200 text-red-600 shadow-inner' : 'bg-white border-slate-200 text-slate-500 shadow-sm'}`}
              >
                <HelpCircle size={16} /> Aide : {showHint ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <AnimatePresence>
              {isGameWon && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md"
                >
                  <motion.div 
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white p-12 rounded-[48px] shadow-2xl text-center max-w-sm mx-4"
                  >
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-black mb-3 text-slate-900">Félicitations !</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      Muriel & Ingrid, vous avez réussi ! Votre surprise arrive...
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case 'boarding':
        return (
          <motion.div 
            key="boarding"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-12 px-6 min-h-screen bg-slate-100"
          >
            <div className="text-center mb-10">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-block bg-green-100 text-green-700 px-8 py-2 rounded-full font-black text-xs uppercase tracking-[.3em] mb-6 shadow-sm"
              >
                Mission Accomplie
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">C'est parti !</h2>
            </div>

            <div className="w-full max-w-[520px] bg-white rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.35)] border border-white flex flex-col print:shadow-none print:border-slate-300">
               <div className="bg-red-600 text-white p-10 pb-12">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                      <Plane className="rotate-45 drop-shadow-lg" size={28} />
                      <span className="font-black italic text-3xl tracking-tighter">SÉJOUR EXPRESS</span>
                    </div>
                    <span className="text-[10px] font-black bg-white text-red-600 px-4 py-1.5 rounded-lg tracking-[.3em] shadow-sm">BOARDING PASS</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-[.4em] font-black opacity-80">Priority Boarding - Mamans VIP Edition</p>
               </div>

               <div className="bg-white px-10 py-12 relative -mt-8 rounded-t-[40px] border-t border-slate-50 flex-1">
                  <div className="grid grid-cols-2 gap-10 mb-12">
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Passagères</p>
                      <p className="text-2xl font-black text-slate-900">Muriel & Ingrid</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Vol VIP</p>
                      <p className="text-3xl font-black text-red-600 tracking-tighter italic">ITA-2024</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-6 mb-12 bg-slate-50/50 p-8 rounded-[36px] border border-slate-100">
                    <div className="text-center group">
                      <p className="text-3xl font-black text-slate-900 cursor-default">MAISON</p>
                      <p className="text-[10px] text-slate-400 font-black tracking-[.3em] mt-2">DÉPART</p>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center gap-2 relative">
                      <div className="w-full border-t-2 border-dashed border-slate-300 relative">
                        <motion.div 
                          animate={{ x: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                          className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-50 px-4 py-1"
                        >
                          <Plane size={24} className="text-red-600 fill-red-600" />
                        </motion.div>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[.4em] mt-2">VOL DIRECT</span>
                    </div>

                    <div className="text-center">
                      <p className="text-3xl font-black text-red-600 drop-shadow-sm">ITALIE</p>
                      <p className="text-[10px] text-slate-400 font-black tracking-[.3em] mt-2">ARRIVÉE</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-8 text-center mb-14">
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase mb-1.5 tracking-wider">Classe</p>
                      <p className="font-black text-slate-900">PREMIUM</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase mb-1.5 tracking-wider">Départ</p>
                      <p className="font-black text-red-600">IMMÉDIAT</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase mb-1.5 tracking-wider">Porte</p>
                      <p className="font-black text-slate-900">COEUR</p>
                    </div>
                  </div>

                  <div className="relative h-6 mb-12">
                     <div className="absolute top-1/2 left-0 right-0 border-t-2 border-dashed border-slate-200"></div>
                     <div className="absolute top-0 -left-10 w-12 h-12 bg-slate-100 rounded-full shadow-inner"></div>
                     <div className="absolute top-0 -right-10 w-12 h-12 bg-slate-100 rounded-full shadow-inner"></div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="font-barcode text-7xl md:text-8xl leading-none text-slate-900 mb-6 select-none">
                      ITALY 2024 GIFT
                    </div>
                    <p className="text-[13px] text-slate-500 font-medium italic text-center max-w-[280px] leading-relaxed">
                      Ce bon est valable pour un voyage inoubliable en amoureux de la vie en Italie.
                    </p>
                  </div>
               </div>
            </div>

            <div className="mt-14 flex flex-col items-center gap-6">
              <button 
                onClick={() => window.print()} 
                className="bg-slate-900 text-white font-black uppercase py-5 px-10 rounded-[20px] flex items-center gap-4 shadow-2xl hover:scale-[1.02] transition cursor-pointer"
              >
                <Printer size={22} className="text-red-500" /> Imprimer le cadeau
              </button>
              <button 
                onClick={() => setView('intro')} 
                className="text-slate-400 font-black tracking-widest text-[10px] uppercase hover:text-slate-900 transition-colors py-2"
              >
                Recommencer l'aventure
              </button>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen font-sans overflow-x-hidden">
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
    </div>
  );
}

function PuzzlePieceComponent({ piece, imageUrl, isSelected, onClick }: { 
  piece: PuzzlePiece; 
  imageUrl: string; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const row = Math.floor(piece.originalIndex / PUZZLE_COLS);
  const col = piece.originalIndex % PUZZLE_COLS;
  
  // Calculate background position
  const x = (col / (PUZZLE_COLS - 1)) * 100;
  const y = (row / (PUZZLE_ROWS - 1)) * 100;

  return (
    <motion.div
      layoutId={`piece-${piece.id}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`w-full h-full cursor-pointer relative rounded shadow-lg transition-shadow overflow-hidden ${isSelected ? 'ring-4 ring-offset-2 ring-red-500 z-20 shadow-red-200' : ''}`}
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: `${PUZZLE_COLS * 100}% ${PUZZLE_ROWS * 100}%`,
        backgroundPosition: `${x}% ${y}%`,
      }}
    >
      {isSelected && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-red-600/20 backdrop-blur-[1px]" 
        />
      )}
    </motion.div>
  );
}

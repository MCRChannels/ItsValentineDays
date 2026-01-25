import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Music, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef(null);

  const songUrl = "/song/จะน่ารักไปไหน.mp3";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Auto-play blocked", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) audioRef.current.muted = !isMuted;
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', left: '20px', zIndex: 100 }}>
      <audio ref={audioRef} src={songUrl} loop />

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.8 }}
            className="glass-card"
            style={{
              marginBottom: '10px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderRadius: '16px'
            }}
          >
            <div style={{
              width: '40px', height: '40px', background: '#ffe5ec',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Music size={20} color="var(--color-primary)" />
            </div>
            <div>
              <p style={{ fontSize: '0.8.5rem', fontWeight: 'bold', margin: 0, color: 'var(--color-text)' }}>จะน่ารักไปไหน</p>
              <p style={{ fontSize: '0.7rem', margin: 0, color: 'gray' }}>K.Alget</p>
            </div>

            <div style={{ width: '1px', height: '20px', background: '#ddd', margin: '0 5px' }}></div>

            <button onClick={toggleMute} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              {isMuted ? <VolumeX size={18} color="gray" /> : <Volume2 size={18} color="gray" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => isExpanded ? togglePlay() : setIsExpanded(true)}
        className="glass-card"
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(255,255,255,0.8)',
          cursor: 'pointer',
          background: isPlaying ? 'var(--color-accent)' : 'rgba(255,255,255,0.8)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        }}
      >
        {isPlaying ? <Pause color="white" size={24} /> : <Play color="#ff4d6d" size={24} style={{ marginLeft: '4px' }} />}
      </motion.button>

      {/* Close expand on click outside logic could be added here, simplified for now: click icon to play/pause if expanded */}
      {isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          style={{
            position: 'absolute', top: '-5px', right: '-5px',
            width: '20px', height: '20px', borderRadius: '50%',
            background: 'white', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default MusicPlayer;

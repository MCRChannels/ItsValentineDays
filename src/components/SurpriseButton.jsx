import { useState } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift } from 'lucide-react';

const messages = [
  "รักนะจุ๊บๆ 😘",
  "คิดถึงจังเลยยย 💖",
  "ขอบคุณที่อยู่ข้างกันนะ 🌹",
  "ไปกินติมกันมั้ย? 🍦",
  "น่ารักที่สุดในโลก! 🌍",
  "เจ้าแมวอ้วน! 🐱",
  "งื้อออออออ 🥰"
];

const SurpriseButton = () => {
  const [showMsg, setShowMsg] = useState(false);
  const [msg, setMsg] = useState('');

  const handleClick = () => {
    // Fire Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#ff4d6d', '#ffb3c1', '#ffffff']
    });

    // Random Message
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    setMsg(randomMsg);
    setShowMsg(true);

    // Hide message after 3 seconds
    setTimeout(() => setShowMsg(false), 3000);
  };

  return (
    <>
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 100 }}>
        <motion.button
          onClick={handleClick}
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #ff4d6d, #ff8fa3)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(255, 77, 109, 0.5)',
            color: 'white',
            fontSize: '1.5rem'
          }}
        >
          <Gift size={28} />
        </motion.button>
      </div>

      {/* Message Popup */}
      <AnimatePresence>
        {showMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '20px',
              background: 'white',
              padding: '15px 25px',
              borderRadius: '20px 20px 0 20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              zIndex: 100,
              color: '#ff4d6d',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              border: '2px solid #ffccd5'
            }}
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SurpriseButton;

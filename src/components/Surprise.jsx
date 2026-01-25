import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Gift, X } from 'lucide-react';

const messages = [
    "รักนะเจ้าอ้วน! 🐷",
    "คิดถึงจังเลยยย 💖",
    "ขอบคุณที่อยู่ข้างกันนะ 🌹",
    "วันนี้น่ารักจัง 😍",
    "ไปกินติมกันมั้ย? 🍦",
    "จุ๊บๆ 😘",
    "เธอคือของขวัญที่ดีที่สุด 🎁",
    "อยู่ด้วยกันไปนานๆ นะ 👵👴",
    "เหนื่อยมั้ย? กอดหน่อย 🫂",
    "ยิ้มเยอะๆ นะ โลกสดใสเพราะเธอ 🌞"
];

const Surprise = () => {
    const [showModal, setShowModal] = useState(false);
    const [currentMsg, setCurrentMsg] = useState("");

    const handleSurprise = () => {
        // Fire Confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff4d6d', '#ff8fa3', '#fff0f3', '#ffe5ec']
        });

        // Pick Random Message
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        setCurrentMsg(randomMsg);
        setShowModal(true);
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSurprise}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff4d6d, #ff8fa3)',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(255, 77, 109, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 100
                }}
            >
                <Gift color="white" size={28} />
            </motion.button>

            {/* Message Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0,
                            width: '100%', height: '100%',
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(3px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 101
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, rotate: [0, -5, 5, 0] }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-card"
                            style={{
                                padding: '2rem',
                                maxWidth: '300px',
                                textAlign: 'center',
                                position: 'relative',
                                borderRadius: '24px',
                                border: '2px solid rgba(255, 255, 255, 0.5)'
                            }}
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    position: 'absolute', top: '10px', right: '10px',
                                    background: 'none', border: 'none', cursor: 'pointer'
                                }}
                            >
                                <X size={20} color="#ff4d6d" />
                            </button>

                            <h3 style={{ fontSize: '1.5rem', marginTop: '1rem', color: 'var(--color-primary)' }}>
                                {currentMsg}
                            </h3>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Surprise;

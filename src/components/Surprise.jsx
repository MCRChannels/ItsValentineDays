import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Gift, X } from 'lucide-react';

const messages = [
    "รักนะเบ้บบี้!",
    "คิดถึงพีพีมั้ยจ้ะ 🫢",
    "ขอบคุณที่อยู่ข้างกันนะ 🌹",
    "ไปกินติมกันมั้ย? 🍦",
    "จุ๊บๆ 😘",
    "อยู่ด้วยกันไปนานๆ นะ",
    "เหนื่อยมั้ย? กอดหน่อย 🫂"
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
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                padding: '2.5rem',
                                maxWidth: '360px',
                                width: '90%',
                                textAlign: 'center',
                                position: 'relative',
                                borderRadius: '24px',
                                background: '#ffffff',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }}
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    position: 'absolute', top: '20px', right: '20px',
                                    background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px',
                                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <X size={18} color="#64748b" />
                            </button>

                            <h3 style={{
                                fontSize: '1.5rem',
                                color: '#1e293b',
                                fontFamily: 'Kanit, sans-serif',
                                fontWeight: '500',
                                lineHeight: '1.5',
                                margin: '1.5rem 0 0.5rem 0'
                            }}>
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

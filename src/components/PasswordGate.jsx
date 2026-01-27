import { useState, useEffect } from 'react';
import { Heart, Lock, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const REQUIRED_CODES = ['020747', '231147', '150267'];
const HINTS = ['วันเกิดกัน', 'วันเกิดพีพี', 'วันที่เราขอคบกัน'];

const PasswordGate = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); // 0, 1, 2
    const [inputCode, setInputCode] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const auth = sessionStorage.getItem('site_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff4d6d', '#ff8fa3', '#fff0f3']
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (inputCode === REQUIRED_CODES[currentStep]) {
            // Correct code
            setIsSuccess(true);
            triggerConfetti();
            setError('');

            // Wait for animation before moving to next step
            setTimeout(() => {
                if (currentStep < REQUIRED_CODES.length - 1) {
                    setCurrentStep(prev => prev + 1);
                    setInputCode('');
                    setIsSuccess(false);
                } else {
                    sessionStorage.setItem('site_auth', 'true');
                    setIsAuthenticated(true);
                }
            }, 1000);

        } else {
            // Incorrect code
            setError(`ยังไม่ใช่นะจ้ะคนดีย์ ลองคิดใหม่อีกทีสิ้`);
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setInputCode('');
        }
    };

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #fff0f3 0%, #ffe5ec 100%)',
            padding: '1rem',
            overflow: 'hidden'
        }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{
                        opacity: 1,
                        x: shake ? [-10, 10, -10, 10, 0] : 0,
                        scale: isSuccess ? [1, 1.05, 1] : 1
                    }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        padding: '3rem 2rem',
                        borderRadius: '20px',
                        boxShadow: '0 8px 32px rgba(255, 77, 109, 0.15)',
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        maxWidth: '400px',
                        width: '100%',
                        textAlign: 'center',
                        position: 'relative'
                    }}
                >
                    <div style={{ marginBottom: '1.5rem' }}>
                        <motion.div
                            animate={{ rotate: isSuccess ? [0, 15, -15, 0] : 0 }}
                            style={{
                                width: '80px',
                                height: '80px',
                                background: '#ffe5ec',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem',
                                position: 'relative'
                            }}
                        >
                            {isSuccess ? (
                                <Check size={40} color="#ff4d6d" />
                            ) : (
                                <Heart size={40} color="#ff4d6d" fill="#ff4d6d" />
                            )}

                            <div style={{
                                position: 'absolute',
                                bottom: '-5px',
                                right: '-5px',
                                background: '#c9184a',
                                color: 'white',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                border: '2px solid white'
                            }}>
                                {currentStep + 1}/3
                            </div>
                        </motion.div>

                        <h2 style={{
                            color: '#c9184a',
                            fontFamily: 'Pattaya, sans-serif',
                            fontSize: '24px',
                            marginBottom: '0.5rem'
                        }}>
                            คำถามข้อที่ {currentStep + 1}
                        </h2>
                        <p style={{ color: '#590d22', opacity: 0.9, fontSize: '1.2rem', fontWeight: 'bold', margin: '1rem 0' }}>
                            {HINTS[currentStep]}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <Lock
                                size={20}
                                color="#c9184a"
                                style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }}
                            />
                            <input
                                type="password"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                                placeholder="ใส่รหัสลับของเราสิ้ . . ."
                                maxLength={6}
                                autoFocus
                                disabled={isSuccess}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 45px',
                                    borderRadius: '10px',
                                    border: '2px solid #ffe5ec',
                                    outline: 'none',
                                    fontSize: '1.1rem',
                                    color: '#c9184a',
                                    background: 'white',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#ff4d6d'}
                                onBlur={(e) => e.target.style.borderColor = '#ffe5ec'}
                            />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ color: '#ff4d6d', marginBottom: '1rem', fontSize: '0.9rem' }}
                                >
                                    {error}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isSuccess}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: 'none',
                                borderRadius: '10px',
                                background: isSuccess ? '#4cc9f0' : '#ff4d6d',
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, background 0.2s',
                                boxShadow: '0 4px 15px rgba(255, 77, 109, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {isSuccess ? 'เย้ ถูกต้อง!' : (currentStep < 2 ? 'ถัดไป' : 'เข้าสู่ระบบ')}
                            {!isSuccess && <ArrowRight size={20} />}
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
                            {[0, 1, 2].map(step => (
                                <motion.div
                                    key={step}
                                    animate={{
                                        scale: step === currentStep ? 1.2 : 1,
                                        backgroundColor: step <= currentStep ? '#ff4d6d' : '#ffe5ec'
                                    }}
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%'
                                    }}
                                />
                            ))}
                        </div>
                    </form>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default PasswordGate;

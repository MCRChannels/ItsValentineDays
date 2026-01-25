import { useState, useEffect } from 'react';
import { Heart, Lock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const REQUIRED_CODES = ['020747', '231147', '150266'];
const HINTS = ['วันเกิดกัน', 'วันเกิดพีพี', 'วันที่เราขอคบกัน'];

const PasswordGate = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentStep, setCurrentStep] = useState(0); // 0, 1, 2
    const [inputCode, setInputCode] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);

    useEffect(() => {
        const auth = sessionStorage.getItem('site_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (inputCode === REQUIRED_CODES[currentStep]) {
            // Correct code for current step
            if (currentStep < REQUIRED_CODES.length - 1) {
                // Move to next step
                setCurrentStep(prev => prev + 1);
                setInputCode(''); // Clear input for next code
                setError('');
            } else {
                // Final step completed
                sessionStorage.setItem('site_auth', 'true');
                setIsAuthenticated(true);
            }
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
            padding: '1rem'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    x: shake ? [-10, 10, -10, 10, 0] : 0
                }}
                transition={{ duration: 0.3 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    padding: '3rem 2rem',
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(255, 77, 109, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    maxWidth: '400px',
                    width: '100%',
                    textAlign: 'center'
                }}
            >
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: '#ffe5ec',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        position: 'relative'
                    }}>
                        <Heart size={40} color="#ff4d6d" fill="#ff4d6d" />
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
                    </div>
                    <h2 style={{
                        color: '#c9184a',
                        fontFamily: 'Pattaya',
                        fontSize: '25px',
                        marginBottom: '0.5rem'
                    }}>
                        ก่อนจะเข้าเว็บไซต์ ต้องใส่รหัสลับก่อน
                    </h2>
                    <p style={{marginBottom: '0.5rem'}}>รหัสผ่านไม่ต้องใส่ / นะ ใส่ตัวเลขทั้งหมดเบย</p>
                    <p style={{ color: '#590d22', opacity: 0.9, fontSize: '1.2rem', fontWeight: 'bold' }}>
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
                            placeholder={HINTS[currentStep]}
                            maxLength={6}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '12px 12px 12px 45px',
                                borderRadius: '10px',
                                border: '2px solid #ffe5ec',
                                outline: 'none',
                                fontSize: '1.1rem',
                                color: '#c9184a',
                                background: 'rgba(255, 255, 255, 0.9)',
                                transition: 'border-color 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#ff4d6d'}
                            onBlur={(e) => e.target.style.borderColor = '#ffe5ec'}
                        />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                style={{ color: '#ff4d6d', marginBottom: '1rem', fontSize: '0.9rem' }}
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: 'none',
                            borderRadius: '10px',
                            background: '#ff4d6d',
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
                        onMouseEnter={(e) => {
                            e.target.style.background = '#c9184a';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = '#ff4d6d';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        {currentStep < 2 ? 'ถัดไป' : 'เข้าสู่ระบบ'}
                        {currentStep < 2 && <ArrowRight size={20} />}
                    </button>

                    {/* Progress Dots */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
                        {[0, 1, 2].map(step => (
                            <div
                                key={step}
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: step <= currentStep ? '#ff4d6d' : '#ffe5ec',
                                    transition: 'background 0.3s'
                                }}
                            />
                        ))}
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default PasswordGate;

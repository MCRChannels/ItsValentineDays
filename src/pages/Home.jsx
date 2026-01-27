import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Timer from '../components/Timer';
import MemorySection from '../components/MemorySection';

const Home = () => {
    const navigate = useNavigate();
    const [clickCount, setClickCount] = useState(0);

    const handleHeartClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        if (newCount === 5) {
            navigate('/admin');
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
            <motion.header
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '2rem',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <span
                    className="hero-emoji"
                    onClick={handleHeartClick}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                    ❤️
                </span>
                <h1 className="hero-title">
                    สุขสันต์วันวาเลนไทน์นะอ้วน !
                </h1>
                <p style={{
                    fontSize: '1.3rem',
                    color: 'var(--color-text)',
                    maxWidth: '600px',
                    margin: '0 auto 2rem auto'
                }}>
                    - ขอบคุณนะที่อยู่ด้วยกันมาตลอด 2 ปี -
                </p>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ position: 'absolute', bottom: '2rem', color: 'var(--color-accent)', opacity: 0.7 }}
                >
                    <p>เลื่อนลงมาข้างล่างจิ ↓</p>
                </motion.div>
            </motion.header>

            {/* Timer Section - Below the fold */}
            <section style={{
                minHeight: 'auto', // Allow content to flow naturally
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start', // Start from top
                paddingTop: '6rem', // Add some space from the top edge
                paddingBottom: '2rem'
            }}>
                <div className="glass-card" style={{ padding: '2rem', width: 'fit-content', maxWidth: '90vw' }}>
                    <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1rem', textAlign: 'center' }}>
                        เวลาทั้งหมดที่เราอยู่ด้วยกัน
                    </h2>
                    <Timer />
                </div>
            </section>

            <MemorySection />

            <footer style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                position: 'relative',
                zIndex: 1,
                background: 'rgba(255,255,255,0.4)'
            }}>
                <h2 style={{ color: 'var(--color-accent)', fontSize: '2.5rem', marginBottom: '1rem' }}>
                    ชั้นรักแกนะ
                </h2>
                <p style={{ fontSize: '1.2rem' }}>
                    ขอบคุณที่คอยอยู่ด้วยกันมาตลอดสองปี
                </p>
                <div style={{ marginTop: '2rem', fontSize: '1rem', opacity: 0.8 }}>
                    พีพี ❤️ กัน
                </div>
            </footer>
        </div>
    );
};

export default Home;

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const linkStyle = (path, isMobile = false) => ({
        textDecoration: 'none',
        color: isActive(path) ? '#c9184a' : '#590d22',
        fontWeight: isActive(path) ? 'bold' : 'normal',
        fontSize: isMobile ? '1.5rem' : '1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: '10px',
        background: isActive(path) ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
        transition: 'all 0.3s ease',
        width: isMobile ? '100%' : 'auto',
        justifyContent: isMobile ? 'center' : 'flex-start'
    });

    const toggleMenu = () => setIsOpen(!isOpen);

    const menuVariants = {
        closed: {
            opacity: 0,
            y: "-100%",
            transition: {
                delay: 0.1,
                type: "spring",
                stiffness: 400,
                damping: 40
            }
        },
        open: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 40
            }
        }
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    padding: '0.8rem 1rem',
                    zIndex: 1000,
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255, 77, 109, 0.2)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                {/* Logo Removed as requested */}

                {/* Desktop Menu - Centered */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'center' }}>
                    <Link to="/" style={linkStyle('/')}>
                        หน้าแรก
                    </Link>
                    <Link to="/feelings" style={linkStyle('/feelings')}>
                        ความในใจ
                    </Link>
                    <Link to="/gallery" style={linkStyle('/gallery')}>
                        รูปภาพของเรา
                    </Link>
                </div>

                {/* Mobile Menu Toggle - Positioned Absolute Right */}
                <div className="mobile-menu-toggle" onClick={toggleMenu} style={{
                    cursor: 'pointer',
                    color: '#c9184a',
                    position: 'absolute',
                    right: '1.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)'
                }}>
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={menuVariants}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100vh',
                            background: 'rgba(255, 240, 243, 0.98)',
                            backdropFilter: 'blur(15px)',
                            zIndex: 999, // Just below navbar
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '2rem',
                            paddingTop: '4rem'
                        }}
                    >
                        <Link to="/" style={linkStyle('/', true)} onClick={toggleMenu}>
                            หน้าแรก
                        </Link>
                        <Link to="/feelings" style={linkStyle('/feelings', true)} onClick={toggleMenu}>
                            ความในใจ
                        </Link>
                        <Link to="/gallery" style={linkStyle('/gallery', true)} onClick={toggleMenu}>
                            รูปภาพของเรา
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Responsive Styles Injection */}
            <style>{`
                .mobile-menu-toggle {
                    display: none;
                }
                
                @media (max-width: 768px) {
                    .desktop-menu {
                        display: none !important;
                    }
                    .mobile-menu-toggle {
                        display: block;
                    }
                }
            `}</style>
        </>
    );
};

export default Navbar;

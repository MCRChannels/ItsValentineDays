import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { memories as localMemories } from '../data/memories';

const MemoryCard = ({ memory, isActive }) => {
    return (
        <motion.div
            animate={{
                opacity: isActive ? 1 : 0.7,
                scale: isActive ? 1 : 0.9,
                y: isActive ? -10 : 0,
                filter: isActive ? 'none' : 'blur(1px) grayscale(20%)' // Reduced blur
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="glass-card"
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: isActive ? '2px solid rgba(255, 77, 109, 0.6)' : '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: isActive
                    ? '0 20px 40px -10px rgba(255, 77, 109, 0.3)'
                    : '0 10px 20px -5px rgba(0,0,0,0.05)',
                transformOrigin: 'center center',
                background: isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.5)',
                borderRadius: '24px', // Rounded corners for the whole card
                overflow: 'hidden' // Ensure image respects border radius
            }}
        >
            {/* Image Section - Takes up most space */}
            <div style={{
                position: 'relative',
                width: '100%',
                flex: '1', // Grow to fill available space
                minHeight: '65%',
                overflow: 'hidden',
                background: '#ffe5ec'
            }}>
                {['mp4', 'webm', 'ogg', 'mov'].some(ext => memory.img.toLowerCase().includes(ext)) ? (
                    <video
                        src={memory.img}
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                ) : (
                    <img
                        src={memory.img}
                        alt={memory.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                )}
            </div>

            {/* Content Section - Bottom padding */}
            <div style={{
                padding: '1.25rem 1.5rem',
                textAlign: 'center',
                flex: '0 0 auto',
                background: 'rgba(255,255,255,0.4)', // Slight separation
                backdropFilter: 'blur(5px)'
            }}>
                <h3 style={{
                    color: 'var(--color-accent)',
                    fontSize: '1.8rem',
                    marginBottom: '0.25rem',
                    lineHeight: '1.2'
                }}>
                    {memory.title}
                </h3>
                <p style={{
                    color: '#ff8fa3',
                    fontSize: '0.9rem',
                    fontStyle: 'italic',
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                }}>
                    {memory.date}
                </p>
                <p style={{
                    lineHeight: '1.4',
                    fontSize: '0.95rem',
                    color: 'var(--color-text)',
                    opacity: 0.9,
                    display: '-webkit-box',
                    WebkitLineClamp: '3',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {memory.description}
                </p>
            </div>
        </motion.div>
    );
};

const MemorySection = () => {
    const [memoriesList, setMemoriesList] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchMemories = async () => {
            const { data, error } = await supabase
                .from('memories')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                console.error('Error fetching memories:', error);
                setMemoriesList(localMemories);
            } else {
                setMemoriesList(data && data.length > 0 ? data : localMemories);
            }
        };

        fetchMemories();

        const channel = supabase
            .channel('memories-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'memories' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setMemoriesList(prev => {
                            const newList = [...prev, payload.new];
                            return newList.sort((a, b) => a.id - b.id);
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        setMemoriesList(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
                    } else if (payload.eventType === 'DELETE') {
                        setMemoriesList(prev => prev.filter(item => item.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);


    const handleScroll = () => {
        const container = scrollRef.current;
        if (!container) return;

        const containerCenter = container.getBoundingClientRect().left + container.clientWidth / 2;

        let closestIndex = 0;
        let minDistance = Number.MAX_VALUE;

        // Filter for actual memory card containers
        const children = Array.from(container.children).filter(child =>
            child.classList.contains('memory-card-wrapper')
        );

        children.forEach((child, index) => {
            const childRect = child.getBoundingClientRect();
            const childCenter = childRect.left + childRect.width / 2;
            const distance = Math.abs(containerCenter - childCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });

        setActiveIndex(closestIndex);
    };


    const scroll = (direction) => {
        const container = scrollRef.current;
        if (container) {
            const scrollAmount = 350;
            if (direction === 'left') {
                container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <section style={{ padding: '2rem 0', position: 'relative', zIndex: 1, maxWidth: '100vw', overflow: 'hidden' }}>
            <h2 style={{
                textAlign: 'center',
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                color: 'var(--color-accent)',
                marginBottom: '2rem',
                textShadow: '2px 2px 4px rgba(255,255,255,0.5)',
                padding: '0 1rem'
            }}>
                ความทรงจำเล้กๆ ของเรา
            </h2>

            <div
                style={{ position: 'relative', maxWidth: '1400px', margin: '0 auto' }}
            >
                {/* Navigation Buttons - Hidden on very small mobile for cleaner look, visible on larger */}
                <button
                    onClick={() => scroll('left')}
                    className="nav-btn"
                    style={{
                        position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                        zIndex: 20, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                        width: '45px', height: '45px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--color-accent)'
                    }}
                >
                    ❮
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="nav-btn"
                    style={{
                        position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                        zIndex: 20, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                        width: '45px', height: '45px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--color-accent)'
                    }}
                >
                    ❯
                </button>

                <div
                    ref={scrollRef}
                    className="hide-scrollbar"
                    onScroll={handleScroll}
                    style={{
                        display: 'flex',
                        overflowX: 'auto',
                        gap: '2rem',
                        padding: '3rem calc(50% - 170px)', // Centering offset for 340px width
                        scrollSnapType: 'x mandatory',
                        WebkitOverflowScrolling: 'touch',
                        alignItems: 'center',
                        scrollBehavior: 'smooth',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    <style>{`
                        .hide-scrollbar::-webkit-scrollbar { display: none; }
                        @media (max-width: 768px) {
                            .nav-btn { display: none !important; }
                        }
                    `}</style>

                    {memoriesList.map((memory, index) => (
                        <div
                            key={memory.id}
                            className="memory-card-wrapper"
                            style={{
                                flex: '0 0 auto',
                                width: '340px', // Slightly wider
                                maxWidth: '85vw',
                                height: '600px', // Reduced height for better portrait ratio
                                scrollSnapAlign: 'center',
                                perspective: '1000px',
                                zIndex: activeIndex === index ? 10 : 1,
                                display: 'flex',
                                justifyContent: 'center'
                            }}
                        >
                            <MemoryCard memory={memory} index={index} isActive={index === activeIndex} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MemorySection;

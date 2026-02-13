import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { galleryImages as localGalleryImages } from '../data/gallery';

// --- Scrapbook decoration data ---
const TAPE_COLORS = [
    'rgba(255, 200, 200, 0.75)',
    'rgba(200, 230, 255, 0.75)',
    'rgba(255, 240, 180, 0.75)',
    'rgba(220, 200, 255, 0.75)',
    'rgba(200, 255, 220, 0.75)',
    'rgba(255, 220, 240, 0.75)',
];

const PIN_COLORS = ['#ff4d6d', '#4cc9f0', '#f72585', '#ff9e00', '#7209b7', '#06d6a0'];

const STICKERS = ['🌸', '💕', '✨', '🦋', '🌷', '💖', '🎀', '💝', '🌹', '💗', '🧸', '🍰', '💌', '🎵', '🌈'];

const DOODLES = [
    // Small heart doodle
    (x, y, size) => (
        <svg key={`d-${x}-${y}`} width={size} height={size} viewBox="0 0 24 24" style={{ position: 'absolute', left: x, top: y, opacity: 0.15, transform: `rotate(${Math.random() * 40 - 20}deg)` }}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="var(--color-primary)" />
        </svg>
    ),
    // Small star doodle
    (x, y, size) => (
        <svg key={`d-${x}-${y}`} width={size} height={size} viewBox="0 0 24 24" style={{ position: 'absolute', left: x, top: y, opacity: 0.12, transform: `rotate(${Math.random() * 60 - 30}deg)` }}>
            <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.4 5.7 21l2.3-7L2 9.4h7.6z" fill="var(--color-accent)" />
        </svg>
    ),
];

// Seeded random for consistent layout per item
const seededRandom = (seed) => {
    let s = seed;
    return () => {
        s = (s * 16807 + 0) % 2147483647;
        return (s - 1) / 2147483646;
    };
};

const Gallery = () => {
    const [galleryList, setGalleryList] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchGallery = async () => {
            const { data, error } = await supabase
                .from('gallery')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                console.error('Error fetching gallery:', error);
                setGalleryList(localGalleryImages);
            } else {
                if (data && data.length > 0) {
                    setGalleryList(data);
                } else {
                    setGalleryList(localGalleryImages);
                }
            }
        };

        fetchGallery();

        const channel = supabase
            .channel('gallery-channel')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'gallery' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setGalleryList(prev => {
                            const newList = [...prev, payload.new];
                            return newList.sort((a, b) => a.id - b.id);
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        setGalleryList(prev => prev.map(item => item.id === payload.new.id ? payload.new : item));
                    } else if (payload.eventType === 'DELETE') {
                        setGalleryList(prev => prev.filter(item => item.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Generate decoration data for each card using stable seed
    const decorations = useMemo(() => {
        return galleryList.map((item, index) => {
            const rand = seededRandom(item.id * 1000 + index * 77);
            const rotation = rand() * 8 - 4; // -4 to +4 degrees
            const tapeColor = TAPE_COLORS[Math.floor(rand() * TAPE_COLORS.length)];
            const pinColor = PIN_COLORS[Math.floor(rand() * PIN_COLORS.length)];
            const sticker = STICKERS[Math.floor(rand() * STICKERS.length)];
            const stickerX = rand() * 60 + 20; // % position
            const stickerY = rand() > 0.5 ? -8 : 90; // top or bottom area
            const usePin = rand() > 0.5;
            const tapeAngle = rand() * 30 - 15;
            const tapeWidth = rand() * 30 + 50; // 50-80px
            const shadowAngle = rand() * 4 - 2;
            return { rotation, tapeColor, pinColor, sticker, stickerX, stickerY, usePin, tapeAngle, tapeWidth, shadowAngle };
        });
    }, [galleryList]);

    const isVideo = (url) => ['mp4', 'webm', 'ogg', 'mov'].some(ext => url.toLowerCase().includes(ext));

    // Navigate lightbox
    const navigateLightbox = (direction) => {
        if (selectedImage === null) return;
        const currentIdx = galleryList.findIndex(img => img.id === selectedImage.id);
        let newIdx = currentIdx + direction;
        if (newIdx < 0) newIdx = galleryList.length - 1;
        if (newIdx >= galleryList.length) newIdx = 0;
        setSelectedImage(galleryList[newIdx]);
    };

    return (
        <>
            <div className="scrapbook-page">
                {/* Page header */}
                <motion.div
                    className="scrapbook-header"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="scrapbook-header-deco scrapbook-header-deco-left">🌸</div>
                    <div className="scrapbook-header-inner">
                        <h1 className="scrapbook-title">รูปภาพของเรา</h1>
                        <p className="scrapbook-subtitle">~ ทุกช่วงเวลาที่มีความสุขด้วยกัน ~</p>
                    </div>
                    <div className="scrapbook-header-deco scrapbook-header-deco-right">🌷</div>
                </motion.div>

                {/* Masonry-like grid */}
                <div className="scrapbook-grid">
                    {galleryList.map((image, index) => {
                        const deco = decorations[index];
                        if (!deco) return null;

                        return (
                            <motion.div
                                key={image.id}
                                className="scrapbook-card-wrapper"
                                initial={{ opacity: 0, y: 40, rotate: deco.rotation * 2 }}
                                animate={{ opacity: 1, y: 0, rotate: deco.rotation }}
                                transition={{ delay: Math.min(index * 0.08, 1.5), duration: 0.5, ease: 'easeOut' }}
                                whileHover={{
                                    rotate: 0,
                                    scale: 1.04,
                                    zIndex: 10,
                                    transition: { duration: 0.25 }
                                }}
                            >
                                <div
                                    className="scrapbook-card"
                                    onClick={() => setSelectedImage(image)}
                                    style={{ boxShadow: `${deco.shadowAngle}px 4px 12px rgba(0,0,0,0.12)` }}
                                >
                                    {/* Tape or Pin decoration */}
                                    {deco.usePin ? (
                                        <div className="scrapbook-pin" style={{ background: deco.pinColor }}>
                                            <div className="scrapbook-pin-shine" />
                                        </div>
                                    ) : (
                                        <div
                                            className="scrapbook-tape"
                                            style={{
                                                background: deco.tapeColor,
                                                transform: `rotate(${deco.tapeAngle}deg)`,
                                                width: `${deco.tapeWidth}px`
                                            }}
                                        />
                                    )}

                                    {/* Photo */}
                                    <div className="scrapbook-photo">
                                        {isVideo(image.img) ? (
                                            <video
                                                src={image.img}
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                className="scrapbook-media"
                                            />
                                        ) : (
                                            <img
                                                src={image.img}
                                                alt={image.caption || 'Gallery photo'}
                                                className="scrapbook-media"
                                                loading="lazy"
                                            />
                                        )}

                                        {/* Hover overlay */}
                                        <div className="scrapbook-photo-overlay">
                                            <span>กดเพื่อดูรูปภาพ</span>
                                        </div>
                                    </div>

                                    {/* Caption area */}
                                    {image.caption && (
                                        <div className="scrapbook-caption">
                                            <p>{image.caption}</p>
                                        </div>
                                    )}

                                    {/* Corner sticker */}
                                    <div
                                        className="scrapbook-sticker"
                                        style={{
                                            left: `${deco.stickerX}%`,
                                            top: deco.stickerY < 0 ? `${deco.stickerY}px` : 'auto',
                                            bottom: deco.stickerY >= 0 ? `-6px` : 'auto',
                                        }}
                                    >
                                        {deco.sticker}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom decoration */}
                <motion.div
                    className="scrapbook-footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <span>💕</span>
                    <span className="scrapbook-footer-text"></span>
                    <span>💕</span>
                </motion.div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        className="lightbox-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            className="lightbox-content"
                            initial={{ scale: 0.7, rotate: -5 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0.7, rotate: 5, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>✕</button>

                            {/* Navigation */}
                            <button className="lightbox-nav lightbox-nav-prev" onClick={() => navigateLightbox(-1)}>‹</button>
                            <button className="lightbox-nav lightbox-nav-next" onClick={() => navigateLightbox(1)}>›</button>

                            {/* Tape decoration */}
                            <div className="lightbox-tape lightbox-tape-left" />
                            <div className="lightbox-tape lightbox-tape-right" />

                            {/* Image */}
                            <div className="lightbox-photo-frame">
                                {isVideo(selectedImage.img) ? (
                                    <video
                                        src={selectedImage.img}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        controls
                                        className="lightbox-media"
                                    />
                                ) : (
                                    <img
                                        src={selectedImage.img}
                                        alt={selectedImage.caption || ''}
                                        className="lightbox-media"
                                    />
                                )}
                            </div>

                            {/* Caption */}
                            {selectedImage.caption && (
                                <div className="lightbox-caption">
                                    <p>{selectedImage.caption}</p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sriracha&display=swap');

                .scrapbook-page {
                    padding-top: 100px;
                    min-height: 100vh;
                    padding-bottom: 4rem;
                    max-width: 1300px;
                    margin: 0 auto;
                    padding-left: 1rem;
                    padding-right: 1rem;
                    position: relative;
                    /* Paper texture feel */
                    background-image:
                        radial-gradient(ellipse at 20% 50%, rgba(255, 200, 210, 0.15) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 30%, rgba(200, 220, 255, 0.12) 0%, transparent 50%),
                        radial-gradient(ellipse at 50% 80%, rgba(255, 240, 200, 0.1) 0%, transparent 50%);
                }

                /* ===== HEADER ===== */
                .scrapbook-header {
                    text-align: center;
                    margin-bottom: 1rem;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                }
                .scrapbook-header-deco {
                    font-size: 2rem;
                    animation: floatSoft 3s ease-in-out infinite;
                }
                .scrapbook-header-deco-left { animation-delay: 0s; }
                .scrapbook-header-deco-right { animation-delay: 1.5s; }

                @keyframes floatSoft {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-6px) rotate(5deg); }
                }

                .scrapbook-header-inner {
                    position: relative;
                }

                .scrapbook-title {
                    font-family: 'Sriracha', 'Pattaya', cursive;
                    font-size: clamp(2.5rem, 6vw, 4rem);
                    color: var(--color-accent);
                    text-shadow: 2px 2px 0px rgba(255,200,210,0.5);
                    margin-bottom: 0.25rem;
                    letter-spacing: 2px;
                    line-height: 1.2;
                }

                .scrapbook-subtitle {
                    font-family: 'Sriracha', cursive;
                    font-size: clamp(1.1rem, 3vw, 1.5rem);
                    color: var(--color-secondary);
                    font-weight: 400;
                }

                .scrapbook-count {
                    text-align: center;
                    font-family: 'Sriracha', cursive;
                    font-size: 1.2rem;
                    color: var(--color-text);
                    opacity: 0.6;
                    margin-bottom: 2rem;
                }

                /* ===== GRID ===== */
                .scrapbook-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 28px 24px;
                    padding: 0 0.5rem;
                }

                /* ===== CARD ===== */
                .scrapbook-card-wrapper {
                    perspective: 800px;
                }

                .scrapbook-card {
                    background: #fffef9;
                    padding: 10px 10px 8px 10px;
                    border-radius: 4px;
                    position: relative;
                    cursor: pointer;
                    transition: box-shadow 0.3s ease;
                    /* Polaroid-like shadow */
                    box-shadow: 2px 4px 12px rgba(0,0,0,0.1);
                    border: 1px solid rgba(0,0,0,0.04);
                }
                .scrapbook-card:hover {
                    box-shadow: 4px 8px 24px rgba(255,77,109,0.2) !important;
                }

                /* ===== TAPE ===== */
                .scrapbook-tape {
                    position: absolute;
                    top: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    height: 22px;
                    border-radius: 2px;
                    z-index: 3;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.08);
                    pointer-events: none;
                }

                /* ===== PIN ===== */
                .scrapbook-pin {
                    position: absolute;
                    top: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    z-index: 3;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.25), inset 0 -1px 2px rgba(0,0,0,0.15);
                }
                .scrapbook-pin-shine {
                    position: absolute;
                    top: 3px;
                    left: 4px;
                    width: 6px;
                    height: 5px;
                    background: rgba(255,255,255,0.5);
                    border-radius: 50%;
                }

                /* ===== PHOTO ===== */
                .scrapbook-photo {
                    width: 100%;
                    aspect-ratio: 4/5;
                    border-radius: 2px;
                    overflow: hidden;
                    position: relative;
                    background: #f0ece4;
                }
                .scrapbook-media {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.4s ease;
                }
                .scrapbook-card:hover .scrapbook-media {
                    transform: scale(1.05);
                }

                /* Photo overlay on hover */
                .scrapbook-photo-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(201, 24, 74, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                }
                .scrapbook-photo-overlay span {
                    background: rgba(255,255,255,0.9);
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-family: 'Sriracha', cursive;
                    font-size: 1.1rem;
                    color: var(--color-accent);
                    font-weight: 600;
                }
                .scrapbook-card:hover .scrapbook-photo-overlay {
                    opacity: 1;
                }

                /* ===== CAPTION ===== */
                .scrapbook-caption {
                    padding: 6px 4px 2px;
                    text-align: center;
                }
                .scrapbook-caption p {
                    font-family: 'Caveat', cursive;
                    font-size: 1.05rem;
                    color: var(--color-text);
                    line-height: 1.3;
                    font-weight: 600;
                    margin: 0;
                }

                /* ===== STICKER ===== */
                .scrapbook-sticker {
                    position: absolute;
                    font-size: 1.3rem;
                    z-index: 4;
                    pointer-events: none;
                    filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.1));
                    transition: transform 0.3s;
                }
                .scrapbook-card:hover .scrapbook-sticker {
                    transform: scale(1.3) rotate(15deg);
                }

                /* ===== FOOTER ===== */
                .scrapbook-footer {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin-top: 3rem;
                    padding: 1rem;
                }
                .scrapbook-footer-text {
                    font-family: 'Caveat', cursive;
                    font-size: 1.4rem;
                    color: var(--color-secondary);
                    font-weight: 600;
                }

                /* ===== LIGHTBOX ===== */
                .lightbox-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(8px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                }
                .lightbox-content {
                    position: relative;
                    background: #fffef9;
                    padding: 16px;
                    border-radius: 6px;
                    max-width: 90vw;
                    max-height: 90vh;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .lightbox-close {
                    position: absolute;
                    top: -14px;
                    right: -14px;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--color-accent);
                    color: white;
                    border: 3px solid #fffef9;
                    font-size: 1rem;
                    cursor: pointer;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }
                .lightbox-close:hover {
                    transform: scale(1.15) rotate(90deg);
                }

                .lightbox-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.9);
                    border: none;
                    font-size: 1.8rem;
                    cursor: pointer;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-accent);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    transition: all 0.2s;
                    line-height: 1;
                    padding-bottom: 3px;
                }
                .lightbox-nav:hover {
                    background: var(--color-accent);
                    color: white;
                    transform: translateY(-50%) scale(1.1);
                }
                .lightbox-nav-prev { left: -22px; }
                .lightbox-nav-next { right: -22px; }

                .lightbox-tape {
                    position: absolute;
                    top: -8px;
                    width: 70px;
                    height: 20px;
                    background: rgba(255, 240, 180, 0.7);
                    border-radius: 2px;
                    z-index: 5;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
                }
                .lightbox-tape-left { left: 20px; transform: rotate(-12deg); }
                .lightbox-tape-right { right: 20px; transform: rotate(8deg); }

                .lightbox-photo-frame {
                    max-width: 100%;
                    max-height: 70vh;
                    overflow: hidden;
                    border-radius: 2px;
                    background: #f0ece4;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .lightbox-media {
                    max-width: 100%;
                    max-height: 70vh;
                    object-fit: contain;
                    display: block;
                }
                .lightbox-caption {
                    padding: 10px 8px 4px;
                    text-align: center;
                }
                .lightbox-caption p {
                    font-family: 'Caveat', cursive;
                    font-size: 1.4rem;
                    color: var(--color-text);
                    font-weight: 600;
                    margin: 0;
                }

                /* ===== RESPONSIVE ===== */

                /* Tablets */
                @media (max-width: 1024px) {
                    .scrapbook-grid {
                        grid-template-columns: repeat(3, 1fr);
                        gap: 22px 18px;
                    }
                }

                /* Large phones / small tablets */
                @media (max-width: 768px) {
                    .scrapbook-page {
                        padding-top: 85px;
                        padding-left: 0.75rem;
                        padding-right: 0.75rem;
                    }
                    .scrapbook-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px 14px;
                    }
                    .scrapbook-card {
                        padding: 8px 8px 6px 8px;
                    }
                    .scrapbook-tape {
                        height: 18px;
                        top: -8px;
                    }
                    .scrapbook-pin {
                        width: 14px;
                        height: 14px;
                        top: -6px;
                    }
                    .scrapbook-pin-shine {
                        width: 5px;
                        height: 4px;
                        top: 2px;
                        left: 3px;
                    }
                    .scrapbook-sticker {
                        font-size: 1rem;
                    }
                    .scrapbook-caption p {
                        font-size: 0.9rem;
                    }
                    .scrapbook-photo-overlay {
                        display: none;
                    }

                    /* Lightbox mobile */
                    .lightbox-content {
                        max-width: 95vw;
                        padding: 10px;
                    }
                    .lightbox-nav {
                        width: 36px;
                        height: 36px;
                        font-size: 1.4rem;
                    }
                    .lightbox-nav-prev { left: -12px; }
                    .lightbox-nav-next { right: -12px; }
                    .lightbox-close {
                        top: -10px;
                        right: -10px;
                        width: 30px;
                        height: 30px;
                        font-size: 0.85rem;
                    }
                    .lightbox-tape { width: 50px; height: 16px; }
                }

                /* Small phones */
                @media (max-width: 420px) {
                    .scrapbook-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 16px 10px;
                    }
                    .scrapbook-header-deco { font-size: 1.5rem; }
                    .scrapbook-card {
                        padding: 6px 6px 4px 6px;
                    }
                    .scrapbook-photo {
                        aspect-ratio: 3/4;
                    }
                }
            `}</style>
        </>
    );
};

export default Gallery;

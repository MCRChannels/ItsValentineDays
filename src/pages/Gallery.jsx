import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { galleryImages as localGalleryImages } from '../data/gallery';

const Gallery = () => {
    const [galleryList, setGalleryList] = useState([]);

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
    }, []);

    return (
        <div className="container" style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '4rem' }}>
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    textAlign: 'center',
                    color: 'var(--color-accent)',
                    marginBottom: '2rem',
                    fontSize: '3rem'
                }}
            >
                รูปภาพของเรา
            </motion.h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '20px',
            }}>
                {galleryList.map((image, index) => (
                    <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card"
                        style={{ overflow: 'hidden', padding: '10px' }}
                    >
                        <div style={{
                            width: '100%',
                            height: '300px',
                            borderRadius: '15px',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            {image.img.endsWith('.mp4') ? (
                                <video
                                    src={image.img}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <img
                                    src={image.img}
                                    alt={image.caption}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                />
                            )}
                        </div>
                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                            <p style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{image.caption}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Gallery;

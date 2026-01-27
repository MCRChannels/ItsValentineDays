import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

const Feelings = () => {
    const [messages, setMessages] = useState([]);
    const [name, setName] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        fetchMessages();

        const channel = supabase
            .channel('messages-channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    setMessages((prev) => [payload.new, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.log('Error fetching messages:', error);
        else setMessages(data || []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !note.trim()) return;

        const { error } = await supabase
            .from('messages')
            .insert([{ name, note }]);

        if (error) {
            alert('Error sending message!');
            console.log(error);
        } else {
            setNote('');
            fetchMessages(); // Refresh list
        }
    };

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
                ความในใจที่อยากบอกกันและกัน
            </motion.h1>

            {/* Form Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>ชื่อของคุณ:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="ใส่ชื่อนิดนึง ตรงเน้..."
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '10px',
                                border: '1px solid #ffd1dc',
                                fontSize: '1rem',
                                fontFamily: 'Kanit, sans-serif'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>ความในใจ:</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="อยากบอกอะไรเค้าก้พิมพ์ตรงนี้เลย..."
                            rows="4"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '10px',
                                border: '1px solid #ffd1dc',
                                fontSize: '1rem',
                                fontFamily: 'Kanit, sans-serif',
                                resize: 'vertical'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '25px',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'transform 0.2s',
                            fontFamily: 'Kanit, sans-serif'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                        ส่งความในใจมาซะ อิอิ ❤️
                    </button>
                </form>
            </motion.div>

            {/* Messages List */}
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card"
                        style={{
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                            position: 'relative',
                            background: 'rgba(255, 255, 255, 0.9)'
                        }}
                    >
                        <p style={{ fontSize: '1.2rem', marginBottom: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            "{msg.note}"
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--color-accent)' }}>- {msg.name}</span>
                            <span style={{ fontSize: '0.9rem', color: '#888' }}>
                                {new Date(msg.created_at).toLocaleString('th-TH')}
                            </span>
                        </div>
                    </motion.div>
                ))}

                {messages.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#888', fontStyle: 'italic' }}>เห้อออยังไม่มีใครบอกรักกันเลย</p>
                )}
            </div>
        </div>
    );
};

export default Feelings;

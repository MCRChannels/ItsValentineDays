import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { memories as localMemories } from '../data/memories';
import { galleryImages as localGallery } from '../data/gallery';
import { Trash, Edit, RefreshCw } from 'lucide-react'; // Assuming you have lucide-react installed

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('memory'); // memory, gallery, sync

    // Data Lists
    const [memories, setMemories] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form States
    const [editId, setEditId] = useState(null); // If set, we are editing
    const [memoryTitle, setMemoryTitle] = useState('');
    const [memoryDate, setMemoryDate] = useState('');
    const [memoryDesc, setMemoryDesc] = useState('');
    const [memoryFile, setMemoryFile] = useState(null);
    const [memoryImgPreview, setMemoryImgPreview] = useState('');

    const [galleryCaption, setGalleryCaption] = useState('');
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryImgPreview, setGalleryImgPreview] = useState('');
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated]);

    const fetchData = async () => {
        setLoading(true);
        const { data: mems } = await supabase.from('memories').select('*').order('id', { ascending: false });
        const { data: gals } = await supabase.from('gallery').select('*').order('id', { ascending: false });

        if (mems) setMemories(mems);
        if (gals) setGallery(gals);
        setLoading(false);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === '#Pee0646122016') {
            setIsAuthenticated(true);
        } else {
            alert('Wrong Password!');
        }
    };

    const uploadImage = async (file, folder) => {
        if (!file) return null;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const resetForms = () => {
        setEditId(null);
        setMemoryTitle('');
        setMemoryDate('');
        setMemoryDesc('');
        setMemoryFile(null);
        setMemoryImgPreview('');
        setGalleryCaption('');
        setGalleryFiles([]);
        setGalleryImgPreview('');
        setUploadProgress({ current: 0, total: 0 });
    };

    // --- CRUD MEMORY ---

    const handleSubmitMemory = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            let imgUrl = memoryImgPreview;

            if (memoryFile) {
                imgUrl = await uploadImage(memoryFile, 'memories');
            }

            const payload = {
                title: memoryTitle,
                date: memoryDate,
                description: memoryDesc,
                img: imgUrl
            };

            if (editId) {
                // Update
                const { error } = await supabase.from('memories').update(payload).eq('id', editId);
                if (error) throw error;
                alert('Memory Updated!');
            } else {
                // Insert
                const { error } = await supabase.from('memories').insert([payload]);
                if (error) throw error;
                alert('Memory Added!');
            }

            resetForms();
            fetchData();
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditMemory = (item) => {
        setActiveTab('memory');
        setEditId(item.id);
        setMemoryTitle(item.title);
        setMemoryDate(item.date);
        setMemoryDesc(item.description);
        setMemoryImgPreview(item.img);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteMemory = async (id) => {
        if (!window.confirm('Delete this memory?')) return;
        setLoading(true);
        await supabase.from('memories').delete().eq('id', id);
        fetchData();
    };

    // --- CRUD GALLERY ---

    const handleSubmitGallery = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            if (editId) {
                // --- EDIT MODE: single file ---
                let imgUrl = galleryImgPreview;
                if (galleryFiles.length > 0) {
                    imgUrl = await uploadImage(galleryFiles[0], 'gallery');
                }
                const payload = { caption: galleryCaption, img: imgUrl };
                const { error } = await supabase.from('gallery').update(payload).eq('id', editId);
                if (error) throw error;
                alert('Gallery Item Updated!');
            } else {
                // --- ADD MODE: multiple files ---
                if (galleryFiles.length === 0) {
                    alert('กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์');
                    setLoading(false);
                    return;
                }

                const total = galleryFiles.length;
                setUploadProgress({ current: 0, total });
                const payloads = [];

                for (let i = 0; i < total; i++) {
                    setUploadProgress({ current: i + 1, total });
                    const imgUrl = await uploadImage(galleryFiles[i], 'gallery');
                    payloads.push({ caption: galleryCaption, img: imgUrl });
                }

                const { error } = await supabase.from('gallery').insert(payloads);
                if (error) throw error;
                alert(`เพิ่มรูปภาพ ${total} รายการสำเร็จ! 🎉`);
            }

            resetForms();
            fetchData();
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
            setUploadProgress({ current: 0, total: 0 });
        }
    };

    const handleEditGallery = (item) => {
        setActiveTab('gallery');
        setEditId(item.id);
        setGalleryCaption(item.caption);
        setGalleryImgPreview(item.img);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteGallery = async (id) => {
        if (!window.confirm('Delete this image?')) return;
        setLoading(true);
        await supabase.from('gallery').delete().eq('id', id);
        fetchData();
    };

    // --- SYNC ---
    const handleSyncData = async () => {
        if (!window.confirm("Upload local data to Supabase? Duplicates possible.")) return;
        setLoading(true);
        // Sync Memories
        await supabase.from('memories').insert(localMemories.map(m => ({
            title: m.title, date: m.date, description: m.description, img: m.img
        })));
        // Sync Gallery
        await supabase.from('gallery').insert(localGallery.map(g => ({
            caption: g.caption, img: g.img
        })));
        alert("Sync Done!");
        fetchData();
    };


    if (!isAuthenticated) {
        return (
            <div className="container" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--color-accent)', marginBottom: '1rem' }}>Admin Access 🔒</h2>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Secret Password"
                            style={{
                                width: '100%', padding: '12px', borderRadius: '10px',
                                border: '1px solid #ffccd5', marginBottom: '1rem', outline: 'none'
                            }}
                        />
                        <button type="submit" style={{
                            width: '100%', padding: '12px', background: 'var(--color-primary)',
                            color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer'
                        }}>
                            Unlock Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '4rem', maxWidth: '1200px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h1 style={{ color: 'var(--color-accent)', fontFamily: 'Pattaya', fontSize: 'clamp(2rem, 5vw, 2.5rem)', margin: 0 }}>Admin Dashboard</h1>
                    <button onClick={fetchData} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                        <RefreshCw color="var(--color-accent)" size={24} />
                    </button>
                </div>
            </div>

            {/* TABS */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                {['memory', 'gallery', 'sync'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); resetForms(); }}
                        style={{
                            padding: '10px 24px',
                            background: activeTab === tab ? 'var(--color-accent)' : 'rgba(255,255,255,0.5)',
                            color: activeTab === tab ? 'white' : 'var(--color-text)',
                            border: 'none',
                            borderRadius: '20px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: activeTab === tab ? '0 4px 15px rgba(255, 77, 109, 0.4)' : 'none'
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <div className="admin-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>

                {/* LEFT COLUMN: FORM */}
                <div className="glass-card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
                        {editId ? 'Edit Item' : 'Add New Item'}
                    </h3>

                    {activeTab === 'memory' && (
                        <form onSubmit={handleSubmitMemory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input type="text" placeholder="Title" value={memoryTitle} onChange={e => setMemoryTitle(e.target.value)} className="admin-input" required />
                            <input type="text" placeholder="Date (e.g. 14 Feb 2024)" value={memoryDate} onChange={e => setMemoryDate(e.target.value)} className="admin-input" required />
                            <textarea placeholder="Description" rows={4} value={memoryDesc} onChange={e => setMemoryDesc(e.target.value)} className="admin-input" required />

                            <label className="file-upload">
                                <span>{memoryFile ? memoryFile.name : 'Choose Image/Video'}</span>
                                <input type="file" accept="image/*,video/*" onChange={e => setMemoryFile(e.target.files[0])} hidden />
                            </label>

                            {editId && <div style={{ fontSize: '0.8rem', color: 'gray' }}>* Leave image blank to keep existing</div>}

                            <button type="submit" className="admin-btn" disabled={loading}>
                                {loading ? 'Processing...' : (editId ? 'Update Memory' : 'Add Memory')}
                            </button>
                            {editId && <button type="button" onClick={resetForms} style={{ background: 'gray', color: 'white', padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>Cancel Edit</button>}
                        </form>
                    )}

                    {activeTab === 'gallery' && (
                        <form onSubmit={handleSubmitGallery} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input type="text" placeholder="Caption (Optional) — ใช้กับทุกรูป" value={galleryCaption} onChange={e => setGalleryCaption(e.target.value)} className="admin-input" />

                            <label className="file-upload" style={{ position: 'relative' }}>
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    📸 {galleryFiles.length > 0
                                        ? `เลือกแล้ว ${galleryFiles.length} ไฟล์`
                                        : (editId ? 'Choose Image/Video' : 'เลือกรูปภาพ/วิดีโอ (เลือกได้หลายไฟล์)')}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple={!editId}
                                    onChange={e => setGalleryFiles(Array.from(e.target.files))}
                                    hidden
                                />
                            </label>

                            {/* File previews */}
                            {galleryFiles.length > 0 && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                                    gap: '8px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    padding: '8px',
                                    background: 'rgba(255,255,255,0.6)',
                                    borderRadius: '10px',
                                    border: '1px solid #ffe5ec'
                                }}>
                                    {galleryFiles.map((file, idx) => (
                                        <div key={idx} style={{
                                            width: '100%',
                                            aspectRatio: '1',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            background: '#f0f0f0'
                                        }}>
                                            {file.type.startsWith('video/') ? (
                                                <video
                                                    src={URL.createObjectURL(file)}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    muted
                                                />
                                            ) : (
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            )}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                background: 'rgba(0,0,0,0.5)',
                                                color: 'white',
                                                fontSize: '0.6rem',
                                                padding: '2px 4px',
                                                textAlign: 'center',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {file.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload progress */}
                            {uploadProgress.total > 0 && (
                                <div style={{ width: '100%' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '6px',
                                        fontSize: '0.85rem',
                                        color: 'var(--color-primary)',
                                        fontWeight: 'bold'
                                    }}>
                                        <span>⬆️ กำลังอัพโหลด...</span>
                                        <span>{uploadProgress.current}/{uploadProgress.total}</span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '8px',
                                        background: '#ffe5ec',
                                        borderRadius: '10px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                                            borderRadius: '10px',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                </div>
                            )}

                            {editId && <div style={{ fontSize: '0.8rem', color: 'gray' }}>* Leave image blank to keep existing</div>}

                            <button type="submit" className="admin-btn" disabled={loading}>
                                {loading
                                    ? (uploadProgress.total > 0
                                        ? `กำลังอัพโหลด ${uploadProgress.current}/${uploadProgress.total}...`
                                        : 'Processing...')
                                    : (editId
                                        ? 'Update Item'
                                        : `เพิ่มรูปภาพ${galleryFiles.length > 0 ? ` (${galleryFiles.length} ไฟล์)` : ''}`)}
                            </button>
                            {editId && <button type="button" onClick={resetForms} style={{ background: 'gray', color: 'white', padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>Cancel Edit</button>}
                        </form>
                    )}

                    {activeTab === 'sync' && (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ marginBottom: '1rem' }}>Sync local data files to Supabase.</p>
                            <button onClick={handleSyncData} className="admin-btn" style={{ background: '#ff9900' }}>Start Sync</button>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: LIST */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
                        Existing Items ({activeTab === 'memory' ? memories.length : gallery.length})
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeTab === 'memory' ? (
                            memories.map(item => (
                                <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                        {['mp4', 'webm', 'ogg', 'mov'].some(ext => item.img.toLowerCase().includes(ext)) ? (
                                            <video src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                        ) : (
                                            <img src={item.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 style={{ color: 'var(--color-accent)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
                                        <small style={{ color: 'gray' }}>{item.date}</small>
                                        <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleEditMemory(item)} style={{ padding: '8px', background: '#4cc9f0', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white' }}><Edit size={18} /></button>
                                        <button onClick={() => handleDeleteMemory(item.id)} style={{ padding: '8px', background: '#f72585', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white' }}><Trash size={18} /></button>
                                    </div>
                                </div>
                            ))
                        ) : activeTab === 'gallery' ? (
                            gallery.map(item => (
                                <div key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                        {['mp4', 'webm', 'ogg', 'mov'].some(ext => item.img.toLowerCase().includes(ext)) ? (
                                            <video src={item.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                                        ) : (
                                            <img src={item.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.caption || 'No Caption'}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleEditGallery(item)} style={{ padding: '8px', background: '#4cc9f0', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white' }}><Edit size={18} /></button>
                                        <button onClick={() => handleDeleteGallery(item.id)} style={{ padding: '8px', background: '#f72585', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white' }}><Trash size={18} /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Select a tab to view items.</p>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .admin-input {
                    padding: 12px;
                    border-radius: 10px;
                    border: 1px solid #ffe5ec;
                    background: rgba(255,255,255,0.9);
                    width: 100%;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .admin-input:focus {
                    border-color: var(--color-accent);
                }
                .admin-btn {
                    padding: 12px;
                    background: var(--color-accent);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                .admin-btn:hover {
                    transform: translateY(-2px);
                }
                .file-upload {
                    padding: 12px;
                    background: white;
                    border: 1px dashed var(--color-accent);
                    border-radius: 10px;
                    text-align: center;
                    cursor: pointer;
                    color: var(--color-text);
                }
                @media (max-width: 900px) {
                    .container {
                        width: 100vw !important;
                        overflow-x: hidden !important;
                        padding-left: 1rem !important;
                        padding-right: 1rem !important;
                    }
                    .admin-grid-layout {
                        display: flex !important;
                        flex-direction: column !important;
                        width: 100% !important;
                        gap: 2rem !important;
                    }
                    .glass-card {
                        position: static !important;
                        padding: 1.5rem !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Admin;

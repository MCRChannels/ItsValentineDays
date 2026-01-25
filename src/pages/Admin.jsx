import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { memories } from '../data/memories';
import { galleryImages } from '../data/gallery';

const Admin = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('memory'); // memory, gallery, sync

    // Form States
    const [memoryTitle, setMemoryTitle] = useState('');
    const [memoryDate, setMemoryDate] = useState('');
    const [memoryDesc, setMemoryDesc] = useState('');
    const [memoryFile, setMemoryFile] = useState(null); // Changed to File object

    const [galleryCaption, setGalleryCaption] = useState('');
    const [galleryFile, setGalleryFile] = useState(null); // Changed to File object

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

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleAddMemory = async (e) => {
        e.preventDefault();
        try {
            let imgUrl = '';
            if (memoryFile) {
                imgUrl = await uploadImage(memoryFile, 'memories');
            }

            const { error } = await supabase
                .from('memories')
                .insert([{
                    title: memoryTitle,
                    date: memoryDate,
                    description: memoryDesc,
                    img: imgUrl
                }]);

            if (error) throw error;

            alert('Memory added successfully!');
            setMemoryTitle('');
            setMemoryDate('');
            setMemoryDesc('');
            setMemoryFile(null);
        } catch (error) {
            alert('Error adding memory: ' + error.message);
        }
    };

    const handleAddGallery = async (e) => {
        e.preventDefault();
        try {
            let imgUrl = '';
            if (galleryFile) {
                imgUrl = await uploadImage(galleryFile, 'gallery');
            }

            const { error } = await supabase
                .from('gallery')
                .insert([{
                    caption: galleryCaption,
                    img: imgUrl
                }]);

            if (error) throw error;

            alert('Gallery image added successfully!');
            setGalleryCaption('');
            setGalleryFile(null);
        } catch (error) {
            alert('Error adding gallery image: ' + error.message);
        }
    };

    const handleSyncData = async () => {
        if (!window.confirm("Are you sure you want to upload all local data to Supabase? This might create duplicates if run multiple times.")) return;

        // Sync Memories
        const { error: memError } = await supabase
            .from('memories')
            .insert(memories.map(m => ({
                title: m.title,
                date: m.date,
                description: m.description,
                img: m.img
            })));

        if (memError) console.error("Memory Sync Error:", memError);

        // Sync Gallery
        const { error: galError } = await supabase
            .from('gallery')
            .insert(galleryImages.map(g => ({
                caption: g.caption,
                img: g.img
            })));

        if (galError) console.error("Gallery Sync Error:", galError);

        alert("Sync process finished. Check console for any errors.");
    };

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ paddingTop: '100px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                <div className="glass-card" style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
                    <h2>Top Secret Login 🤫</h2>
                    <form onSubmit={handleLogin} style={{ marginTop: '1rem' }}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Password"
                            style={{ padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '1rem' }}
                        />
                        <button type="submit" style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '5px' }}>
                            Unlock
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '4rem', position: 'relative', zIndex: 10 }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Admin Dashboard</h1>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button onClick={() => setActiveTab('memory')} style={{ padding: '10px', background: activeTab === 'memory' ? 'var(--color-primary)' : '#ccc', color: 'white', border: 'none', borderRadius: '5px' }}>Add Memory</button>
                <button onClick={() => setActiveTab('gallery')} style={{ padding: '10px', background: activeTab === 'gallery' ? 'var(--color-primary)' : '#ccc', color: 'white', border: 'none', borderRadius: '5px' }}>Add Gallery</button>
                <button onClick={() => setActiveTab('sync')} style={{ padding: '10px', background: activeTab === 'sync' ? 'var(--color-primary)' : '#ccc', color: 'white', border: 'none', borderRadius: '5px' }}>Sync Data</button>
            </div>

            <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
                {activeTab === 'memory' && (
                    <form onSubmit={handleAddMemory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3>Add New Memory</h3>
                        <input type="text" placeholder="Title" value={memoryTitle} onChange={e => setMemoryTitle(e.target.value)} style={{ padding: '10px' }} />
                        <input type="text" placeholder="Date (e.g. 14 Feb 2024)" value={memoryDate} onChange={e => setMemoryDate(e.target.value)} style={{ padding: '10px' }} />
                        <textarea placeholder="Description" value={memoryDesc} onChange={e => setMemoryDesc(e.target.value)} style={{ padding: '10px' }} />
                        <label style={{ textAlign: 'left', fontWeight: 'bold' }}>Upload Image:</label>
                        <input type="file" accept="image/*,video/*" onChange={e => setMemoryFile(e.target.files[0])} style={{ padding: '10px' }} />
                        <button type="submit" style={{ padding: '10px', background: 'var(--color-accent)', color: 'white', border: 'none' }}>Add Memory</button>
                    </form>
                )}

                {activeTab === 'gallery' && (
                    <form onSubmit={handleAddGallery} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3>Add Gallery Image</h3>
                        <input type="text" placeholder="Caption" value={galleryCaption} onChange={e => setGalleryCaption(e.target.value)} style={{ padding: '10px' }} />
                        <label style={{ textAlign: 'left', fontWeight: 'bold' }}>Upload Image:</label>
                        <input type="file" accept="image/*,video/*" onChange={e => setGalleryFile(e.target.files[0])} style={{ padding: '10px' }} />
                        <button type="submit" style={{ padding: '10px', background: 'var(--color-accent)', color: 'white', border: 'none' }}>Add Image</button>
                    </form>
                )}

                {activeTab === 'sync' && (
                    <div style={{ textAlign: 'center' }}>
                        <h3>Sync Local Data to Database</h3>
                        <p>This will upload all items from <code>memories.js</code> and <code>gallery.js</code> to Supabase.</p>
                        <button onClick={handleSyncData} style={{ padding: '15px', background: 'red', color: 'white', border: 'none', borderRadius: '5px', marginTop: '1rem', cursor: 'pointer' }}>
                            Sync Now (Warning: Duplicates possible)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const authMsg = document.getElementById('auth-msg');

// Tabs
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.target).classList.add('active');
    });
});

// Check Auth State
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        authScreen.style.display = 'none';
        dashboardScreen.style.display = 'block';
        loadDashboard();
    } else {
        authScreen.style.display = 'block';
        dashboardScreen.style.display = 'none';
    }
});

// Login
loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    authMsg.className = 'error';
    authMsg.textContent = 'Logging in...';
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        authMsg.textContent = error.message;
    } else {
        authMsg.textContent = '';
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
});

// Load Data
async function loadDashboard() {
    loadVideos();
    loadBeats();
    loadMessages();
}

async function loadVideos() {
    const list = document.getElementById('vid-list');
    const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
    if (error) { list.innerHTML = `<div class="error">Error loading videos</div>`; return; }
    
    if (data.length === 0) { list.innerHTML = `<div class="item">No videos added yet.</div>`; return; }
    
    list.innerHTML = data.map(v => `
        <div class="item">
            <div class="item-info">
                <strong>${v.title}</strong>
                <span>${v.platform.toUpperCase()} | ${v.url}</span>
            </div>
            <button class="btn btn-small btn-danger" onclick="window.deleteItem('videos', '${v.id}')">Delete</button>
        </div>
    `).join('');
}

async function loadBeats() {
    const list = document.getElementById('beat-list');
    const { data, error } = await supabase.from('beatstars').select('*').order('created_at', { ascending: false });
    if (error) { list.innerHTML = `<div class="error">Error loading beats</div>`; return; }
    
    if (data.length === 0) { list.innerHTML = `<div class="item">No beats added yet.</div>`; return; }
    
    list.innerHTML = data.map(b => `
        <div class="item">
            <div class="item-info">
                <strong>${b.title}</strong>
                <span>${b.embed_url}</span>
            </div>
            <button class="btn btn-small btn-danger" onclick="window.deleteItem('beatstars', '${b.id}')">Delete</button>
        </div>
    `).join('');
}

async function loadMessages() {
    const list = document.getElementById('msg-list');
    const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (error) { list.innerHTML = `<div class="error">Error loading messages</div>`; return; }
    
    if (data.length === 0) { list.innerHTML = `<div class="item">No messages yet.</div>`; return; }
    
    list.innerHTML = data.map(m => `
        <div class="item" style="flex-direction: column; align-items: flex-start; gap: 10px;">
            <div class="item-info" style="width: 100%;">
                <div style="display:flex; justify-content: space-between;">
                    <strong>From: ${m.name} (${m.email})</strong>
                    <span style="color:var(--red);">${m.inquiry_type || 'General'}</span>
                </div>
                <span style="display:block; margin-top: 10px; color: var(--white); background: var(--black); padding: 10px; border-radius: 4px;">${m.message}</span>
                <span style="display:block; margin-top: 10px; font-size: 11px;">Received: ${new Date(m.created_at).toLocaleString()}</span>
            </div>
            <button class="btn btn-small btn-danger" style="align-self: flex-end;" onclick="window.deleteItem('messages', '${m.id}')">Delete Message</button>
        </div>
    `).join('');
}

// Add Video
document.getElementById('add-vid-btn').addEventListener('click', async () => {
    const title = document.getElementById('vid-title').value;
    const platform = document.getElementById('vid-platform').value;
    const url = document.getElementById('vid-url').value;
    const msg = document.getElementById('vid-msg');
    
    if(!title || !url) { msg.className='error'; msg.textContent='Please fill in all fields'; return; }
    msg.textContent = 'Adding...';
    
    const { error } = await supabase.from('videos').insert([{ title, platform, url }]);
    if (error) { msg.className='error'; msg.textContent = error.message; }
    else {
        msg.className='success'; msg.textContent = 'Video added successfully!';
        document.getElementById('vid-title').value = '';
        document.getElementById('vid-url').value = '';
        loadVideos();
    }
});

// Add Beat
document.getElementById('add-beat-btn').addEventListener('click', async () => {
    const title = document.getElementById('beat-title').value;
    const embed_url = document.getElementById('beat-url').value;
    const msg = document.getElementById('beat-msg');
    
    if(!title || !embed_url) { msg.className='error'; msg.textContent='Please fill in all fields'; return; }
    msg.textContent = 'Adding...';
    
    const { error } = await supabase.from('beatstars').insert([{ title, embed_url }]);
    if (error) { msg.className='error'; msg.textContent = error.message; }
    else {
        msg.className='success'; msg.textContent = 'Beat added successfully!';
        document.getElementById('beat-title').value = '';
        document.getElementById('beat-url').value = '';
        loadBeats();
    }
});

// Global delete function
window.deleteItem = async (table, id) => {
    if(confirm('Are you sure you want to delete this?')) {
        await supabase.from(table).delete().eq('id', id);
        if(table === 'videos') loadVideos();
        if(table === 'beatstars') loadBeats();
        if(table === 'messages') loadMessages();
    }
};

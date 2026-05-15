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


// ─── FOOLPROOF COPY CMS ───
// Default text if empty
const defaultAboutBody = `Cameo Holliday discovered his voice at just 12 years old and began writing music by 16, quickly developing a gift for transforming raw human emotion into melody. A graduate of Bristol Studios in Boston, MA, with an associate's degree in Audio Engineering, Holliday set out with a clear mission: to leave a lasting imprint on the music industry.

A natural creative, Holliday moves seamlessly between writing for himself and crafting records for other artists. As a self-producing artist building in a competitive, independent market, he brings both vision and discipline to every project. For him, music is more than passion it's a way of life. "I live to create, produce, and bring my sound wherever it's needed."

Blending genres with ease, Holliday's sound is best described as charismatic, soulful, and undeniably sensual an authentic reflection of his artistry and presence.

Beyond the studio, Holliday is a seasoned vocalist and performer with an extensive catalog. His discography includes projects such as Rayain, Finally (his solo debut), The Lona Boi Mixtape, Emotions, The EarCrack Compilation, and The Gangsta & The Gentleman. He has also released a series of EPs, including Rose Petals & Lingerie, Stilettos & Black Lace, I'm Still Here, Emotions V2, Brown Liquor Music, and his latest project, Bliss.

With over 6,500 physical copies sold independently and a growing presence across streaming platforms, Holliday continues to expand his reach and connect with new audiences. His latest contemporary R&B project, Bliss, showcases smooth harmonies, refined tones, and a matured sound that signals the evolution of his artistry.

This is only the beginning. Cameo Holliday is building a legacy one record at a time.`;

const defaultMusicBody = `Charismatic, soulful, and undeniably sensual. Cameo Holliday blends R&B, Hip-Hop, and soul into something cinematic and deeply personal. A Bristol Studios graduate with over 6,500 copies sold independently.

Stream everywhere. Buy direct downloads for the highest quality experience.`;

// DOM Elements
const fAboutHead = document.getElementById('f-about-head');
const fAboutBody = document.getElementById('f-about-body');
const fMusicHead = document.getElementById('f-music-head');
const fMusicBody = document.getElementById('f-music-body');
const fMusicEmbed = document.getElementById('f-music-embed');

const stat1Num = document.getElementById('f-stat1-num');
const stat1Lbl = document.getElementById('f-stat1-lbl');
const stat2Num = document.getElementById('f-stat2-num');
const stat2Lbl = document.getElementById('f-stat2-lbl');
const stat3Num = document.getElementById('f-stat3-num');
const stat3Lbl = document.getElementById('f-stat3-lbl');

const prevAbout = document.getElementById('prev-about');
const prevMusic = document.getElementById('prev-music');
const fDescBeats = document.getElementById('f-desc-beats');
const fDescServices = document.getElementById('f-desc-services');
const fDescVideos = document.getElementById('f-desc-videos');
const fDescLicensing = document.getElementById('f-desc-licensing');
const fDescContact = document.getElementById('f-desc-contact');
const prevDescBeats = document.getElementById('prev-desc-beats');

// Toast logic
let toastTimeout;
function showToast() {
  const toast = document.getElementById('toast-limit');
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

// Bind Inputs
function bindInput(inputEl, countElId) {
  const countEl = document.getElementById(countElId);
  const max = inputEl.getAttribute('maxlength');
  
  const update = () => {
    const len = inputEl.value.length;
    countEl.textContent = len + ' / ' + max;
    if (len >= max) {
      countEl.classList.add('limit-reached');
      if (len === parseInt(max)) showToast();
    } else {
      countEl.classList.remove('limit-reached');
    }
    renderPreviews();
  };
  
  inputEl.addEventListener('input', update);
  inputEl.addEventListener('keyup', update);
}

function renderPreviews() {
  // About
  const aHead = fAboutHead.value || 'Headline';
  const aBodyLines = fAboutBody.value ? fAboutBody.value.split('\n\n') : [];
  const aBodyHtml = aBodyLines.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  
  prevAbout.innerHTML = `
    <h3>${aHead}</h3>
    ${aBodyHtml}
    <div style="display:flex; gap:30px; margin-top:30px; border-top:1px solid var(--silver-faint); padding-top:20px;">
      <div>
        <div style="font-family:var(--font-heading); font-size:32px; color:var(--red);">${stat1Num.value || '0'}</div>
        <div style="font-size:11px; text-transform:uppercase; color:var(--silver-dim); letter-spacing:1px;">${stat1Lbl.value || 'Label'}</div>
      </div>
      <div>
        <div style="font-family:var(--font-heading); font-size:32px; color:var(--red);">${stat2Num.value || '0'}</div>
        <div style="font-size:11px; text-transform:uppercase; color:var(--silver-dim); letter-spacing:1px;">${stat2Lbl.value || 'Label'}</div>
      </div>
      <div>
        <div style="font-family:var(--font-heading); font-size:32px; color:var(--red);">${stat3Num.value || '0'}</div>
        <div style="font-size:11px; text-transform:uppercase; color:var(--silver-dim); letter-spacing:1px;">${stat3Lbl.value || 'Label'}</div>
      </div>
    </div>
  `;
  
  prevDescBeats.textContent = fDescBeats.value || 'Description preview...';
  
  // Music
  const mHead = fMusicHead.value || 'Headline';
  const mBodyLines = fMusicBody.value ? fMusicBody.value.split('\n\n') : [];
  const mBodyHtml = mBodyLines.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
  
  prevMusic.innerHTML = `
    <h3>${mHead}</h3>
    ${mBodyHtml}
    <div class="streaming-links-preview">
      <div class="streaming-link-btn">Spotify</div>
      <div class="streaming-link-btn">Apple Music</div>
      <div class="streaming-link-btn">YouTube</div>
    </div>
  `;
}

// Set up
setTimeout(() => {
  bindInput(fAboutHead, 'c-about-head');
  bindInput(fAboutBody, 'c-about-body');
  bindInput(fMusicHead, 'c-music-head');
  bindInput(fMusicBody, 'c-music-body');
  bindInput(fDescBeats, 'c-desc-beats');
  bindInput(fDescServices, 'c-desc-services');
  bindInput(fDescVideos, 'c-desc-videos');
  bindInput(fDescLicensing, 'c-desc-licensing');
  bindInput(fDescContact, 'c-desc-contact');
  
  [stat1Num, stat1Lbl, stat2Num, stat2Lbl, stat3Num, stat3Lbl].forEach(el => {
    el.addEventListener('input', renderPreviews);
  });
}, 100);

async function loadCopy() {
    const { data, error } = await supabase.from('site_content').select('*');
    if (error) { console.error('Error loading copy:', error); return; }
    
    // Set defaults first
    fAboutBody.value = defaultAboutBody;
    fMusicBody.value = defaultMusicBody;
    stat1Num.value = "6,500+"; stat1Lbl.value = "Copies Sold";
    stat2Num.value = "12+"; stat2Lbl.value = "Projects Released";
    stat3Num.value = "4"; stat3Lbl.value = "Platforms";
    fDescBeats.value = "Preview, license, and instantly download premium instrumentals. Trap soul, west coast, R&B — crafted with intention.";
    fDescServices.value = "From custom production to vocal writing and sync placement — let's create something that moves people.";
    fDescVideos.value = "Music videos, live performances, studio sessions, and behind-the-scenes content.";
    fDescLicensing.value = "License original music by Cameo Holliday for your next project. A growing catalog of soulful, cinematic tracks ready for placement.";
    fDescContact.value = "Whether you need a custom beat, vocal work, or want to license music for your project — I'm ready to build something great with you.";
    
    // Override with DB
    data.forEach(item => {
        if (item.id === 'about_head') fAboutHead.value = item.content;
        if (item.id === 'about_body') fAboutBody.value = item.content;
        if (item.id === 'music_head') fMusicHead.value = item.content;
        if (item.id === 'music_body') fMusicBody.value = item.content;
        if (item.id === 'music_embed') fMusicEmbed.value = item.content;
        if (item.id === 'stat1_num') stat1Num.value = item.content;
        if (item.id === 'stat1_lbl') stat1Lbl.value = item.content;
        if (item.id === 'stat2_num') stat2Num.value = item.content;
        if (item.id === 'stat2_lbl') stat2Lbl.value = item.content;
        if (item.id === 'stat3_num') stat3Num.value = item.content;
        if (item.id === 'stat3_lbl') stat3Lbl.value = item.content;
        if (item.id === 'desc_beats') fDescBeats.value = item.content;
        if (item.id === 'desc_services') fDescServices.value = item.content;
        if (item.id === 'desc_videos') fDescVideos.value = item.content;
        if (item.id === 'desc_licensing') fDescLicensing.value = item.content;
        if (item.id === 'desc_contact') fDescContact.value = item.content;
    });
    
    setTimeout(() => {
      fAboutHead.dispatchEvent(new Event('input'));
      fAboutBody.dispatchEvent(new Event('input'));
      fMusicHead.dispatchEvent(new Event('input'));
      fMusicBody.dispatchEvent(new Event('input'));
            fDescBeats.dispatchEvent(new Event('input'));
    }, 200);
}

document.getElementById('publish-copy-btn').addEventListener('click', async () => {
    const btn = document.getElementById('publish-copy-btn');
    const msg = document.getElementById('copy-msg');
    btn.disabled = true;
    btn.textContent = 'Publishing...';
    
    const updates = [
        { id: 'about_head', content: fAboutHead.value },
        { id: 'about_body', content: fAboutBody.value },
        { id: 'music_head', content: fMusicHead.value },
        { id: 'music_body', content: fMusicBody.value },
        { id: 'music_embed', content: fMusicEmbed.value },
        { id: 'stat1_num', content: stat1Num.value },
        { id: 'stat1_lbl', content: stat1Lbl.value },
        { id: 'stat2_num', content: stat2Num.value },
        { id: 'stat2_lbl', content: stat2Lbl.value },
        { id: 'stat3_num', content: stat3Num.value },
        { id: 'stat3_lbl', content: stat3Lbl.value }
        ,{ id: 'desc_beats', content: fDescBeats.value },
        { id: 'desc_services', content: fDescServices.value },
        { id: 'desc_videos', content: fDescVideos.value },
        { id: 'desc_licensing', content: fDescLicensing.value },
        { id: 'desc_contact', content: fDescContact.value }
    ];
    
    const { error } = await supabase.from('site_content').upsert(updates);
    
    btn.disabled = false;
    btn.textContent = 'Publish Changes';
    
    if (error) {
        msg.className = 'error';
        msg.textContent = error.message;
    } else {
        msg.className = 'success';
        msg.textContent = 'Published! The live site is updated.';
        setTimeout(() => msg.textContent = '', 4000);
    }
});

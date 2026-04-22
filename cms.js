import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Initialize Supabase if keys are provided
let supabase = null;
if (SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

async function loadContent() {
    if (!supabase) {
        console.warn('Supabase not configured yet. Showing placeholder content.');
        return;
    }

    // --- Fetch Beatstars ---
    const { data: beats, error: beatsError } = await supabase
        .from('beatstars')
        .select('*')
        .order('sort_order', { ascending: true });

    if (!beatsError && beats && beats.length > 0) {
        const beatsContainer = document.getElementById('beats-container');
        if (beatsContainer) {
            beatsContainer.innerHTML = '';
            beats.forEach(beat => {
                // Determine if url or full iframe code
                let embedHtml = beat.embed_url;
                // If it's just a URL, wrap it in an iframe
                if (beat.embed_url.startsWith('http')) {
                    embedHtml = `<iframe src="${beat.embed_url}" width="100%" height="400" frameborder="0" style="border:none;" allowfullscreen></iframe>`;
                }

                const beatHtml = `
                    <div class="beat-embed" style="margin-bottom: 24px; border-radius: 8px; overflow: hidden; background: var(--black-card); border: 1px solid var(--silver-faint);">
                        ${embedHtml}
                    </div>
                `;
                beatsContainer.innerHTML += beatHtml;
            });
            // remove original placeholder styling classes if any
            beatsContainer.className = ''; 
        }
    }

    // --- Fetch Videos ---
    const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .order('sort_order', { ascending: true });

    if (!videosError && videos && videos.length > 0) {
        const videosContainer = document.getElementById('videos-container');
        if (videosContainer) {
            videosContainer.innerHTML = '';
            videos.forEach(video => {
                let embedCode = '';
                
                if (video.url.includes('<iframe')) {
                    // User pasted full embed code
                    embedCode = video.url;
                } else if (video.platform === 'youtube') {
                    // Convert standard youtube link to embed link if needed
                    let url = video.url;
                    if (url.includes('watch?v=')) {
                        url = url.replace('watch?v=', 'embed/');
                    }
                    embedCode = `<iframe src="${url}" title="${video.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
                } else if (video.platform === 'instagram') {
                    let url = video.url;
                    if (!url.endsWith('/embed')) {
                        if (!url.endsWith('/')) url += '/';
                        url += 'embed';
                    }
                    embedCode = `<iframe src="${url}" width="100%" height="480" frameborder="0" scrolling="no" allowtransparency="true"></iframe>`;
                } else if (video.platform === 'tiktok') {
                    // It's safer to use TikTok's embed code from their site, but we can try to iframe a video URL
                    // Or they can just paste the iframe code in the 'url' field
                    embedCode = `<iframe src="${video.url}" width="100%" height="700" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                } else {
                    embedCode = `<iframe src="${video.url}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
                }
                
                const videoHtml = `
                    <div class="video-card">
                        ${embedCode}
                    </div>
                `;
                videosContainer.innerHTML += videoHtml;
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', loadContent);

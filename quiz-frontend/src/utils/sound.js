// src/utils/sound.js
export const safePlay = (audio) => {
    if (!audio) return;

    try {
        const p = audio.play();
        if (p && typeof p.catch === "function") p.catch(() => { });
    } catch { }
};

export const safeRestart = (audio) => {
    if (!audio) return;

    try {
        audio.currentTime = 0;
    } catch { }
};

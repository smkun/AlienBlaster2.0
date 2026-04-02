const STORAGE_KEY = 'alienBlasterHighScores';
const MAX_SCORES = 20;
// Resolve relative to the page's directory (works regardless of trailing slash)
const scriptUrl = import.meta.url;
const baseDir = scriptUrl.substring(0, scriptUrl.lastIndexOf('/src/'));
const API_URL = baseDir + '/api/scores.php';

export class ScoreManager {
    constructor() {
        this.scores = this.loadLocal();
        this.fetchScores(); // async load from server on startup
    }

    // Local storage as cache/fallback
    loadLocal() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    saveLocal() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.scores));
        } catch {}
    }

    // Fetch scores from server
    async fetchScores() {
        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                const data = await res.json();
                this.scores = data.slice(0, MAX_SCORES);
                this.saveLocal();
            }
        } catch {
            // Offline — use local cache
        }
    }

    // Submit score to server
    async addScore(name, score, wave) {
        // Optimistic local update
        const existing = this.scores.findIndex(s => s.name === name);
        if (existing >= 0) {
            if (score > this.scores[existing].score) {
                this.scores[existing].score = score;
                this.scores[existing].wave = wave;
            }
        } else {
            this.scores.push({ name, score, wave });
        }
        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, MAX_SCORES);
        this.saveLocal();

        // Send to server
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, score, wave }),
            });
            if (res.ok) {
                // Refresh from server to get authoritative list
                await this.fetchScores();
            }
        } catch {
            // Offline — local update is already applied
        }
    }

    isHighScore(score) {
        return this.scores.length < MAX_SCORES || score > (this.scores[this.scores.length - 1]?.score || 0);
    }

    getScores() {
        return this.scores;
    }
}

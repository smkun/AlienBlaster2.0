const STORAGE_KEY = 'alienBlasterHighScores';
const MAX_SCORES = 10;

export class ScoreManager {
    constructor() {
        this.scores = this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.scores));
        } catch {
            // localStorage unavailable, scores persist only in memory
        }
    }

    addScore(name, score, wave) {
        this.scores.push({ name, score, wave, date: Date.now() });
        this.scores.sort((a, b) => b.score - a.score);
        this.scores = this.scores.slice(0, MAX_SCORES);
        this.save();
    }

    isHighScore(score) {
        return this.scores.length < MAX_SCORES || score > (this.scores[this.scores.length - 1]?.score || 0);
    }

    getScores() {
        return this.scores;
    }
}

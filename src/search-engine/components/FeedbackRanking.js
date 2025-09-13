/* =========================================
   Feedback Ranking System
   Croatian Labor Law Fact Checker v2.2.0
   ========================================= */

/**
 * @fileoverview System for ranking search results based on user feedback
 * Tracks which articles users find helpful for specific keywords
 */

export class FeedbackRanking {
    constructor() {
        this.storageKey = 'croatian_law_feedback_rankings';
        this.rankings = this.loadRankings();
        this.decayFactor = 0.95; // Rankings decay over time to stay current
        this.maxRankingScore = 1000;
    }

    /**
     * Load rankings from localStorage
     * @returns {Object} Rankings data
     */
    loadRankings() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                // Apply time decay to existing rankings
                this.applyTimeDecay(data);
                return data;
            }
        } catch (error) {
            console.warn('Error loading feedback rankings:', error);
        }
        
        return {
            keywords: {}, // keyword -> { articleId -> { score, lastUpdated, count } }
            articles: {}, // articleId -> { totalScore, keywordHits }
            lastCleanup: Date.now()
        };
    }

    /**
     * Save rankings to localStorage
     */
    saveRankings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.rankings));
        } catch (error) {
            console.warn('Error saving feedback rankings:', error);
        }
    }

    /**
     * Apply time decay to rankings to keep them current
     * @param {Object} data Rankings data
     */
    applyTimeDecay(data) {
        const now = Date.now();
        const daysSinceCleanup = (now - (data.lastCleanup || 0)) / (1000 * 60 * 60 * 24);
        
        if (daysSinceCleanup > 7) { // Apply decay weekly
            const decayMultiplier = Math.pow(this.decayFactor, daysSinceCleanup / 7);
            
            // Decay keyword rankings
            Object.keys(data.keywords || {}).forEach(keyword => {
                Object.keys(data.keywords[keyword]).forEach(articleId => {
                    data.keywords[keyword][articleId].score *= decayMultiplier;
                });
            });
            
            // Decay article rankings
            Object.keys(data.articles || {}).forEach(articleId => {
                data.articles[articleId].totalScore *= decayMultiplier;
            });
            
            data.lastCleanup = now;
        }
    }

    /**
     * Record positive feedback for an article and keyword
     * @param {string} keyword - Search keyword
     * @param {string} articleId - Article ID that was helpful
     * @param {number} boost - Boost amount (default: 10)
     */
    recordPositiveFeedback(keyword, articleId, boost = 10) {
        const normalizedKeyword = this.normalizeKeyword(keyword);
        const now = Date.now();
        
        // Initialize structures if needed
        if (!this.rankings.keywords[normalizedKeyword]) {
            this.rankings.keywords[normalizedKeyword] = {};
        }
        
        if (!this.rankings.keywords[normalizedKeyword][articleId]) {
            this.rankings.keywords[normalizedKeyword][articleId] = {
                score: 0,
                count: 0,
                lastUpdated: now
            };
        }
        
        if (!this.rankings.articles[articleId]) {
            this.rankings.articles[articleId] = {
                totalScore: 0,
                keywordHits: {}
            };
        }
        
        // Update keyword-specific ranking
        const keywordRanking = this.rankings.keywords[normalizedKeyword][articleId];
        keywordRanking.score = Math.min(this.maxRankingScore, keywordRanking.score + boost);
        keywordRanking.count += 1;
        keywordRanking.lastUpdated = now;
        
        // Update article total ranking
        const articleRanking = this.rankings.articles[articleId];
        articleRanking.totalScore = Math.min(this.maxRankingScore, articleRanking.totalScore + boost);
        articleRanking.keywordHits[normalizedKeyword] = (articleRanking.keywordHits[normalizedKeyword] || 0) + 1;
        
        this.saveRankings();
        
        console.log(`Positive feedback recorded: "${normalizedKeyword}" -> Article ${articleId} (Score: ${keywordRanking.score})`);
    }

    /**
     * Get ranking score for an article given a search query
     * @param {string} articleId - Article ID
     * @param {string} searchQuery - Original search query
     * @returns {number} Ranking score (0-1000)
     */
    getRankingScore(articleId, searchQuery) {
        const keywords = this.extractKeywords(searchQuery);
        let totalScore = 0;
        let matchCount = 0;
        
        keywords.forEach(keyword => {
            const normalizedKeyword = this.normalizeKeyword(keyword);
            const keywordRankings = this.rankings.keywords[normalizedKeyword];
            
            if (keywordRankings && keywordRankings[articleId]) {
                totalScore += keywordRankings[articleId].score;
                matchCount++;
            }
        });
        
        // Include base article score
        if (this.rankings.articles[articleId]) {
            totalScore += this.rankings.articles[articleId].totalScore * 0.1; // 10% weight
        }
        
        // Average score with bonus for multiple keyword matches
        const averageScore = matchCount > 0 ? totalScore / matchCount : 0;
        const matchBonus = matchCount > 1 ? matchCount * 5 : 0;
        
        return Math.min(this.maxRankingScore, averageScore + matchBonus);
    }

    /**
     * Sort search results by ranking score
     * @param {Array} results - Search results
     * @param {string} searchQuery - Original search query
     * @returns {Array} Sorted results with ranking scores
     */
    rankResults(results, searchQuery) {
        return results.map(article => {
            const rankingScore = this.getRankingScore(article.id || article.number, searchQuery);
            return {
                ...article,
                rankingScore,
                feedbackScore: rankingScore,
                isRecommended: rankingScore > 50 // Mark highly ranked results
            };
        }).sort((a, b) => {
            // Primary sort: feedback ranking
            const rankingDiff = (b.rankingScore || 0) - (a.rankingScore || 0);
            if (Math.abs(rankingDiff) > 5) return rankingDiff;
            
            // Secondary sort: relevance score (if available)
            const relevanceDiff = (b.relevanceScore || 0) - (a.relevanceScore || 0);
            if (Math.abs(relevanceDiff) > 0.1) return relevanceDiff;
            
            // Tertiary sort: article number
            return parseInt(a.number || '0') - parseInt(b.number || '0');
        });
    }

    /**
     * Extract meaningful keywords from search query
     * @param {string} query - Search query
     * @returns {Array} Array of keywords
     */
    extractKeywords(query) {
        if (!query) return [];
        
        return query.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2) // Filter out short words
            .filter(word => !this.isStopWord(word))
            .map(word => word.replace(/[^\w]/g, '')); // Remove punctuation
    }

    /**
     * Normalize keyword for consistent storage
     * @param {string} keyword - Raw keyword
     * @returns {string} Normalized keyword
     */
    normalizeKeyword(keyword) {
        return keyword.toLowerCase()
            .trim()
            .replace(/[^\w]/g, '')
            .substring(0, 50); // Limit length
    }

    /**
     * Check if word is a stop word that shouldn't influence rankings
     * @param {string} word - Word to check
     * @returns {boolean} True if stop word
     */
    isStopWord(word) {
        const stopWords = [
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'od', 'do', 'za', 'na', 'je', 'se', 'da', 'su', 'ili', 'ako', 'kad',
            'el', 'la', 'de', 'en', 'es', 'un', 'una', 'con', 'por', 'para', 'que'
        ];
        return stopWords.includes(word.toLowerCase());
    }

    /**
     * Get statistics about feedback rankings
     * @returns {Object} Statistics
     */
    getStatistics() {
        const keywordCount = Object.keys(this.rankings.keywords).length;
        const articleCount = Object.keys(this.rankings.articles).length;
        
        let totalFeedback = 0;
        Object.values(this.rankings.keywords).forEach(articles => {
            Object.values(articles).forEach(data => {
                totalFeedback += data.count;
            });
        });
        
        return {
            keywordCount,
            articleCount,
            totalFeedback,
            avgFeedbackPerArticle: articleCount > 0 ? totalFeedback / articleCount : 0
        };
    }

    /**
     * Clear all rankings (for testing or reset)
     */
    clearRankings() {
        this.rankings = {
            keywords: {},
            articles: {},
            lastCleanup: Date.now()
        };
        this.saveRankings();
    }
}

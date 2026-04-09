const { Review } = require('../models');
const axios = require('axios');

class GoogleReviewsService {
    static async fetchLatestReviews() {
        const apiKey = process.env.GOOGLE_API_KEY;
        const placeId = process.env.GOOGLE_PLACE_ID;

        if (!apiKey || !placeId) {
            console.log('GOOGLE_API_KEY or GOOGLE_PLACE_ID is not set. Skipping Google Reviews fetch.');
            return [];
        }

        try {
            // Places API (New) v1 Endpoint
            // const url = `https://places.googleapis.com/v1/places/${placeId}`;
            const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`;

            console.log('Fetching Google Reviews from:', url);
            const response = await axios.get(url);

            console.log('Google API Response:', JSON.stringify(response.data, null, 2));

            if (response.data && response.data.result.reviews) {
                return response.data.result.reviews;
            }
            return [];
        } catch (error) {
            const errorMsg = error.response?.data?.error?.message || error.message;
            console.error('Error fetching reviews from Google:', errorMsg);
            throw new Error(`Google API Error: ${errorMsg}`);
        }
    }

    static async syncReviews() {
        try {
            const googleReviews = await this.fetchLatestReviews();
            let count = 0;

            for (const gr of googleReviews) {
                // Map the old Place Details API fields to our new model properties
                const reviewData = {
                    author_name: gr.author_name || 'Anonymous',
                    author_url: gr.author_url || null,
                    language: gr.language || null,
                    original_language: gr.original_language || null,
                    profile_photo_url: gr.profile_photo_url || null,
                    rating: gr.rating || 5,
                    relative_time_description: gr.relative_time_description || '',
                    text: gr.text || '',
                    time: gr.time || Math.floor(Date.now() / 1000),
                    translated: gr.translated || false
                };

                await Review.upsert(reviewData);
                count++;
            }

            return { success: true, count, totalFetched: googleReviews.length };
        } catch (error) {
            console.error('Error syncing reviews:', error.message);
            throw error;
        }
    }
}

module.exports = GoogleReviewsService;

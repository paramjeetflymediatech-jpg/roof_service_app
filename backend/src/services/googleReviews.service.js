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
            const url = `https://places.googleapis.com/v1/places/${placeId}`;

            console.log('Fetching Google Reviews from:', url);
            const response = await axios.get(url, {
                headers: {
                    'X-Goog-Api-Key': apiKey,
                    'X-Goog-FieldMask': 'reviews'
                }
            });

            console.log('Google API Response:', JSON.stringify(response.data, null, 2));

            if (response.data && response.data.reviews) {
                return response.data.reviews;
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
                // Places API (New) data structure mapping
                const reviewData = {
                    googleReviewId: gr.name, // Format: places/PLACE_ID/reviews/REVIEW_ID
                    authorName: gr.authorAttribution?.displayName || 'Anonymous',
                    authorPhoto: gr.authorAttribution?.photoUri || null,
                    rating: gr.rating || 5,
                    text: gr.text?.text || '',
                    relativeTimeDescription: gr.relativePublishTimeDescription || '',
                    time: gr.publishTime ? new Date(gr.publishTime) : new Date()
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

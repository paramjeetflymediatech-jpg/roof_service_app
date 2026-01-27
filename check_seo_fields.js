const axios = require('axios');

async function checkSeoFields() {
    try {
        // user mentioned viewing source, implying they probably tested a page. 
        // I'll test 'metal-roofing' as a baseline, assuming they might have edited it. 
        // If 'metal-roofing' is empty, I'll try to find ANY page with these fields.
        const pageName = 'metal-roofing';
        console.log(`Fetching SEO data for ${pageName}...`);
        const response = await axios.get(`http://localhost:5000/api/seo/${pageName}`);

        if (response.data.success) {
            const data = response.data.data;
            console.log('--- SEO DATA RECEIVED ---');
            console.log('Page Title:', data.pageTitle);
            console.log('Schema Markup:', data.schemaMarkup ? 'PRESENT' : 'MISSING/EMPTY');
            console.log('Google Analytics ID:', data.googleAnalyticsId ? data.googleAnalyticsId : 'MISSING/EMPTY');
            console.log('Google Tag Manager ID:', data.googleTagManagerId ? data.googleTagManagerId : 'MISSING/EMPTY');
            console.log('--- FULL DATA ---');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('Success: false');
        }
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }
}

checkSeoFields();

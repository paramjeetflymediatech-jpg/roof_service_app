const axios = require('axios');

async function checkSeo() {
    try {
        console.log('Fetching SEO data for metal-roofing...');
        const response = await axios.get('http://localhost:5000/api/seo/metal-roofing');
        console.log('Success:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

checkSeo();

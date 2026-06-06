'use strict';

// Load environment variables from .env before anything else
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

/**
 * seedServices.js
 * Reads backend/services.json and inserts each entry as:
 *  - A Service record (name = general name like "Roof Repairs", slug = unique slug like "roof-repairs-in-abbotsford", longDescription, whyChooseUs/faqs, seo JSON)
 *  - A SeoMeta record (pageName = path, pageTitle, metaDescription, ogTitle, ogDescription, canonicalUrl, faqSchema)
 *  - A LocationService link (matches service to location by city name)
 *
 * Usage: node src/scripts/seedServices.js
 */

const path = require('path');
const fs = require('fs');

// Load models (this also sets up sequelize + associations)
const { sequelize, Service, SeoMeta, Location, LocationService } = require('../models');

const JSON_FILE = path.join(__dirname, '../../services.json');

async function run() {
  try {
    // Authenticate and sync (alter:true adds any new columns without dropping data)
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync models to ensure new columns (e.g. keywords, faqSchema) exist
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema synced.');

    // Clean up old city-specific services in services table to keep it clean
    const { Op } = require('sequelize');
    await Service.destroy({ where: { slug: { [Op.like]: '%-in-%' } } }).catch(() => {});

    const raw = fs.readFileSync(JSON_FILE, 'utf8');
    const services = JSON.parse(raw);

    console.log(`📄 Found ${services.length} service(s) in services.json`);

    for (const item of services) {
      const {
        city,
        service_name,
        service_slug,
        meta_title,
        keywords,
        meta_description,
        short_description,
        og_title,
        og_description,
        canonical_url,
        path: pagePath,
        content,
        faqs,
      } = item;

      // Extract general service name (first index of split by " in ")
      const nameParts = service_name.split(/ in /i);
      const dbServiceName = nameParts[0].trim();

      // Generate unique slug from the service_name (e.g. "roof-repairs-in-langley")
      const uniqueSlug = service_name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Strip HTML tags from meta_description for plain-text storage (truncate to 200 chars)
      const plainMetaDesc = (meta_description || '')
        .replace(/<[^>]+>/g, '')
        .substring(0, 200);

      // Strip HTML tags from og_description (truncate to 200 chars)
      const plainOgDesc = (og_description || '')
        .replace(/<[^>]+>/g, '')
        .substring(0, 200);

      // Truncate meta_title / og_title to 100 chars
      const truncatedTitle = (meta_title || '').substring(0, 100);
      const truncatedOgTitle = (og_title || meta_title || '').substring(0, 100);

      // Build SEO JSON blob for Service.seo field
      const seoBlob = {
        pageTitle: truncatedTitle,
        metaDescription: plainMetaDesc,
        metaRobots: 'index, follow',
        keywords: keywords || '',
        ogTitle: truncatedOgTitle,
        ogDescription: plainOgDesc,
        canonicalUrl: canonical_url || '',
        schemaMarkup: '',
        googleAnalyticsId: '',
        googleTagManagerId: '',
      };

      // ─── Upsert Generic Service ─────────────────────────────────────────────
      const [service, serviceCreated] = await Service.findOrCreate({
        where: { slug: service_slug },
        defaults: {
          name: dbServiceName,
          slug: service_slug,
          shortDescription: `Professional ${dbServiceName.toLowerCase()} services.`,
          longDescription: `<p>We provide professional ${dbServiceName.toLowerCase()} services across BC.</p>`,
          whyChooseUs: [],
          seo: {
            pageTitle: `${dbServiceName} | Mainstreet Roofing Ltd`,
            metaDescription: `Professional ${dbServiceName.toLowerCase()} services.`,
            metaRobots: 'index, follow',
          },
          status: 'published',
        },
      });

      if (serviceCreated) {
        console.log(`✅ Created generic service: "${dbServiceName}" (slug: ${service_slug})`);
      }

      // ─── Upsert SeoMeta record ───────────────────────────────────────────────
      const seoPageName = pagePath || `/services/${uniqueSlug}`;

      const [seoMeta, seoCreated] = await SeoMeta.findOrCreate({
        where: { pageName: seoPageName },
        defaults: {
          pageName: seoPageName,
          pageTitle: truncatedTitle,
          metaDescription: plainMetaDesc || 'Mainstreet Roofing professional services.',
          metaRobots: 'index, follow',
          keywords: keywords || '',
          ogTitle: truncatedOgTitle,
          ogDescription: plainOgDesc || '',
          canonicalUrl: canonical_url || '',
          faqSchema: faqs || [],
        },
      });

      if (!seoCreated) {
        await seoMeta.update({
          pageTitle: truncatedTitle,
          metaDescription: plainMetaDesc || 'Mainstreet Roofing professional services.',
          keywords: keywords || '',
          ogTitle: truncatedOgTitle,
          ogDescription: plainOgDesc || '',
          canonicalUrl: canonical_url || '',
          faqSchema: faqs || [],
        });
        console.log(`🔄 Updated SeoMeta: "${seoPageName}"`);
      } else {
        console.log(`✅ Created SeoMeta: "${seoPageName}"`);
      }

      // ─── Link and add custom content to LocationService ──────────────────────
      if (city) {
        // Try to find location by exact name match (case-insensitive via LIKE)
        const location = await Location.findOne({
          where: sequelize.where(
            sequelize.fn('LOWER', sequelize.col('name')),
            city.trim().toLowerCase()
          ),
        });

        if (location) {
          const [locationService, linkCreated] = await LocationService.findOrCreate({
            where: {
              locationId: location.id,
              serviceId: service.id,
            },
            defaults: {
              locationId: location.id,
              serviceId: service.id,
              name: service_name,
              shortDescription: short_description || '',
              longDescription: content || '',
              whyChooseUs: faqs || [],
              seo: seoBlob,
            }
          });

          if (!linkCreated) {
            await locationService.update({
              name: service_name,
              shortDescription: short_description || '',
              longDescription: content || '',
              whyChooseUs: faqs || [],
              seo: seoBlob,
            });
            console.log(`🔗 Updated LocationService link: "${service_name}" (Service ID: ${service.id} → Location ID: ${location.id})`);
          } else {
            console.log(`🔗 Created LocationService link: "${service_name}" (Service ID: ${service.id} → Location ID: ${location.id})`);
          }
        } else {
          console.warn(`⚠️  Location not found for city: "${city}" — skipping link`);
        }
      }
    }

    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err.message);
    console.error(err);
    process.exit(1);
  }
}

run();

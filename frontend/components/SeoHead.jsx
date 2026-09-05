import Head from "next/head";
import Script from "next/script";
import { useSeo } from "@/hooks/useSeo";

// Helper to parse raw HTML header scripts into React elements
const parseHeaderScripts = (htmlString) => {
  if (!htmlString) return null;
  const elements = [];
  const tagRegex = /<([a-zA-Z0-9:-]+)([^>]*)(?:>([\s\S]*?)<\/\1>|\s*\/?>)/g;
  
  let match;
  let index = 0;
  while ((match = tagRegex.exec(htmlString)) !== null) {
    const tagName = match[1].toLowerCase();
    const rawAttrs = match[2] || "";
    const content = match[3] || "";
    
    const attrs = {};
    const attrRegex = /([a-zA-Z0-9:-]+)(?:\s*=\s*(?:['"]([^'"]*)['"]|([^\s>]+)))?/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
      const attrName = attrMatch[1];
      let attrValue = attrMatch[2] ?? attrMatch[3] ?? true;
      if (attrName === "class") {
        attrs.className = attrValue;
      } else {
        attrs[attrName] = attrValue;
      }
    }
    
    const key = `hdr-scr-${tagName}-${index++}`;
    
    if (tagName === "script") {
      elements.push(
        <script key={key} {...attrs} dangerouslySetInnerHTML={{ __html: content }} />
      );
    } else if (tagName === "style") {
      elements.push(
        <style key={key} {...attrs} dangerouslySetInnerHTML={{ __html: content }} />
      );
    } else if (tagName === "meta") {
      elements.push(<meta key={key} {...attrs} />);
    } else if (tagName === "link") {
      elements.push(<link key={key} {...attrs} />);
    } else if (tagName === "noscript") {
      elements.push(
        <noscript key={key} {...attrs} dangerouslySetInnerHTML={{ __html: content }} />
      );
    }
  }
  return elements;
};

const SeoHead = ({ pageName, initialSeoData }) => {
  const {
    seoData: fetchedData,
    loading,
    error,
  } = useSeo(pageName, { skip: !!initialSeoData });
  const seoData = initialSeoData || fetchedData;

  // If we have initial data (even null), we are not loading.
  const isLoading = initialSeoData !== undefined ? false : loading;

  if (isLoading) {
    return (
      <Head>
        <title>Loading...</title>
      </Head>
    );
  }

  if (error || !seoData) {
    return (
      <>
        <Head>
          <title>Mainstreet Roofing Ltd</title>
          <meta
            name="description"
            content="Quality materials designed to protect your investment for decades."
          />
        </Head>
        {/* Google Tag Manager loaded without blocking initial render */}
        <Script
          id="gtm-default"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function (w, d, s, l, i) {
                w[l] = w[l] || []; w[l].push({
                    'gtm.start': new Date().getTime(), event: 'gtm.js'
                }); var f = d.getElementsByTagName(s)[0],
                    j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
                    'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
            })(window, document, 'script', 'dataLayer', 'GTM-N5RQJK48');`,
          }}
        />
      </>
    );
  }

  const gtmId = seoData.googleTagManagerId || 'GTM-N5RQJK48';

  return (
    <>
      <Head>
        <title>{seoData.pageTitle || 'Mainstreet Roofing Ltd'}</title>
        <meta name="description" content={seoData.metaDescription || 'Quality materials designed to protect your investment for decades.'} />
        {seoData.metaRobots && <meta name="robots" content={seoData.metaRobots} />}

        {/* Open Graph */}
        {seoData.ogTitle && <meta property="og:title" content={seoData.ogTitle} />}
        {seoData.ogDescription && <meta property="og:description" content={seoData.ogDescription} />}
        {seoData.ogImage && <meta property="og:image" content={seoData.ogImage} />}

        {/* Canonical */}
        {seoData.canonicalUrl && (
          <link rel="canonical" href={seoData.canonicalUrl} />
        )}

        {/* Schema Markup */}
        {seoData.schemaMarkup && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: seoData.schemaMarkup }}
          />
        )}

        {/* Global Header Scripts */}
        {seoData.globalHeaderScripts && parseHeaderScripts(seoData.globalHeaderScripts)}

        {/* Page Specific Header Scripts */}
        {seoData.headerScripts && parseHeaderScripts(seoData.headerScripts)}
      </Head>

      {/* Google Analytics (non-blocking) */}
      {seoData.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${seoData.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${seoData.googleAnalyticsId}');
              `,
            }}
          />
        </>
      )}

      {/* Google Tag Manager (non-blocking) */}
      {gtmId && (
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');`,
          }}
        />
      )}
    </>
  );
};

export default SeoHead;

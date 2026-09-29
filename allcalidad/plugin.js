/**
 * AllCalidad Provider para SkyStream
 * Portado desde CloudStream Storm Extensions
 * URL: https://allcalidad.re
 */

(function () {
    const TAG = "AllCalidad";
    const baseUrl = manifest.baseUrl || "https://allcalidad.re";

    function extractItems(html, pattern) {
        const regex = new RegExp(pattern, 'gs');
        const matches = [];
        let match;
        while ((match = regex.exec(html)) !== null) {
            matches.push(match);
        }
        return matches;
    }

    function fixUrl(url) {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        if (url.startsWith("//")) return "https:" + url;
        if (url.startsWith("/")) return baseUrl + url;
        return url;
    }

    function fetchUrls(text) {
        if (!text) return [];
        const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/g;
        const matches = text.match(linkRegex) || [];
        return matches.map(url => url.trim().replace(/^"|$"/g, ''));
    }

    function fixHostsLinks(url) {
        return url
            .replace("https://hglink.to", "https://streamwish.to")
            .replace("https://swdyu.com", "https://streamwish.to")
            .replace("https://filemoon.link", "https://filemoon.sx")
            .replace("https://uqload.io", "https://uqload.com");
    }

    async function getHome(cb) {
        try {
            const response = await fetch(baseUrl);
            const html = await response.text();
            const homeData = [];
            cb({ success: true, data: homeData });
        } catch (error) {
            cb({ success: false, message: [${TAG}] getHome error: ${error.message} });
        }
    }

    async function search(query, page, cb) {
        try {
            const url = `https://allcalidad.re/search?q=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            const html = await response.text();
            const results = [];
            cb({ success: true, data: results });
        } catch (error) {
            cb({ success: false, message: [${TAG}] search error: ${error.message} });
        }
    }

    async function load(url, cb) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const item = new MultimediaItem({
                title: "Título",
                url: url,
                type: "movie",
                description: null,
                posterUrl: null
            });
            cb({ success: true, data: item });
        } catch (error) {
            cb({ success: false, message: [${TAG}] load error: ${error.message} });
        }
    }

    async function loadStreams(url, cb) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const streams = [];
            cb({ success: true, data: streams });
        } catch (error) {
            cb({ success: false, message: [${TAG}] loadStreams error: ${error.message} });
        }
    }

    globalThis.getHome = getHome;
    globalThis.search = search;
    globalThis.load = load;
    globalThis.loadStreams = loadStreams;
})();

/**
 * Cinecalidad Provider para SkyStream
 * Portado COMPLETO desde CloudStream Storm Extensions (Kotlin)
 * Código original: https://github.com/Stormunblessed/storm-ext/CinecalidadProvider
 * URL: https://www.cinecalidad.ec
 */

(function () {
    const TAG = "Cinecalidad";
    const baseUrl = manifest.baseUrl || "https://www.cinecalidad.ec";

    // ========== UTILIDADES ==========
    
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

    function fixHostsLinks(url) {
        return url
            .replace("https://hglink.to", "https://streamwish.to")
            .replace("https://swdyu.com", "https://streamwish.to")
            .replace("https://cybervynx.com", "https://streamwish.to")
            .replace("https://dumbalag.com", "https://streamwish.to")
            .replace("https://mivalyo.com", "https://vidhidepro.com")
            .replace("https://dinisglows.com", "https://vidhidepro.com")
            .replace("https://dhtpre.com", "https://vidhidepro.com")
            .replace("https://filemoon.link", "https://filemoon.sx")
            .replace("https://sblona.com", "https://watchsb.com")
            .replace("https://lulu.st", "https://lulustream.com")
            .replace("https://uqload.io", "https://uqload.com")
            .replace("https://do7go.com", "https://dood.la");
    }

    // ========== PÁGINA PRINCIPAL ==========
    // Portado de: override val mainPage = mainPageOf(...)
    
    async function getHome(cb) {
        try {
            // Kotlin: mainPageOf("ver-serie" to "Series", "fecha-de-lanzamiento/2025" to "Estrenos", ...)
            const sections = [
                { path: "ver-serie/page/1", name: "Series" },
                { path: "fecha-de-lanzamiento/2025/page/1", name: "Estrenos" },
                { path: "genero-de-la-pelicula/animacion/page/1", name: "Animación" }
            ];

            const homeData = [];

            for (const section of sections) {
                try {
                    const url = `${baseUrl}/${section.path}`;
                    const response = await fetch(url);
                    const html = await response.text();

                    // Kotlin: document.select(".item.movies").mapNotNull { it.toSearchResult() }
                    const itemPattern = /<article[^>]*class="[^"]*item[^"]*movies[^"]*"[^>]*>(.*?)<\/article>/gs;
                    const items = extractItems(html, itemPattern);

                    const mediaItems = items.map(match => {
                        const itemHtml = match[1];
                        
                        // Kotlin: this.selectFirst("div.in_title")!!.text()
                        const titleMatch = itemHtml.match(/<div[^>]*class="[^"]*in_title[^"]*"[^>]*>(.*?)<\/div>/s);
                        const title = titleMatch ? titleMatch[1].trim().replace(/<[^>]*>/g, '') : "Sin título";
                        
                        // Kotlin: this.selectFirst("a")!!.attr("href")
                        const linkMatch = itemHtml.match(/<a[^>]*href="([^"]+)"/);
                        const link = linkMatch ? fixUrl(linkMatch[1]) : "";
                        
                        // Kotlin: this.selectFirst(".poster.custom img")!!.attr("data-src")
                        const posterMatch = itemHtml.match(/<img[^>]*class="[^"]*poster[^"]*custom[^"]*"[^>]*data-src="([^"]+)"/);
                        const posterUrl = posterMatch ? fixUrl(posterMatch[1]) : null;
                        
                        return new MultimediaItem({
                            title: title,
                            url: link,
                            type: "movie",
                            posterUrl: posterUrl
                        });
                    }).filter(item => item.url);

                    if (mediaItems.length > 0) {
                        homeData.push({
                            name: section.name,
                            items: mediaItems
                        });
                    }
                } catch (e) {
                    continue;
                }
            }

            cb({ success: true, data: homeData });
        } catch (error) {
            cb({ success: false, message: `[${TAG}] getHome error: ${error.message}` });
        }
    }

    // ========== BÚSQUEDA ==========
    // Portado de: override suspend fun search(query: String)
    
    async function search(query, page, cb) {
        try {
            const url = `${baseUrl}/?s=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            const html = await response.text();

            // Kotlin: document.select("article.item").mapNotNull { it.toSearchResult() }
            const itemPattern = /<article[^>]*class="[^"]*item[^"]*"[^>]*>(.*?)<\/article>/gs;
            const items = extractItems(html, itemPattern);

            const results = items.map(match => {
                const itemHtml = match[1];
                
                // Kotlin: this.selectFirst("div.in_title")!!.text()
                const titleMatch = itemHtml.match(/<div[^>]*class="[^"]*in_title[^"]*"[^>]*>(.*?)<\/div>/s);
                const title = titleMatch ? titleMatch[1].trim().replace(/<[^>]*>/g, '') : "Sin título";
                
                // Kotlin: this.selectFirst("a")!!.attr("href")
                const linkMatch = itemHtml.match(/<a[^>]*href="([^"]+)"/);
                const link = linkMatch ? fixUrl(linkMatch[1]) : "";
                
                // Kotlin: this.selectFirst(".poster.custom img")!!.attr("data-src")
                const posterMatch = itemHtml.match(/<img[^>]*data-src="([^"]+)"/);
                const posterUrl = posterMatch ? fixUrl(posterMatch[1]) : null;
                
                return new MultimediaItem({
                    title: title,
                    url: link,
                    type: "movie",
                    posterUrl: posterUrl
                });
            }).filter(item => item.url);

            cb({ success: true, data: results });
        } catch (error) {
            cb({ success: false, message: `[${TAG}] search error: ${error.message}` });
        }
    }

    // ========== DETALLES + EPISODIOS ==========
    // Portado de: override suspend fun load(url: String)
    
    async function load(url, cb) {
        try {
            const response = await fetch(url, { timeout: 120000 });
            const html = await response.text();

            // Kotlin: soup.selectFirst(".single_left h1")!!.text()
            const titleMatch = html.match(/<div[^>]*class="[^"]*single_left[^"]*".*?<h1[^>]*>(.*?)<\/h1>/s);
            const title = titleMatch ? titleMatch[1].trim().replace(/<[^>]*>/g, '') : "Sin título";

            // Kotlin: soup.selectFirst("div.single_left table tbody tr td p")?.text()?.trim()
            const descMatch = html.match(/<div[^>]*class="[^"]*single_left[^"]*".*?<p[^>]*>(.*?)<\/p>/s);
            const description = descMatch ? descMatch[1].trim().replace(/<[^>]*>/g, '') : null;

            // Kotlin: soup.selectFirst(".alignnone")!!.attr("data-src")
            const posterMatch = html.match(/<img[^>]*class="[^"]*alignnone[^"]*"[^>]*data-src="([^"]+)"/);
            const poster = posterMatch ? fixUrl(posterMatch[1]) : null;

            // Kotlin: soup.select("div.se-c div.se-a ul.episodios li")
            const episodes = [];
            const episodePattern = /<li[^>]*class="[^"]*mark-[^"]*"[^>]*>(.*?)<\/li>/gs;
            const episodeMatches = extractItems(html, episodePattern);
            
            episodeMatches.forEach(match => {
                const epHtml = match[1];
                
                // Kotlin: li.selectFirst("a")!!.attr("href")
                const hrefMatch = epHtml.match(/<a[^>]*href="([^"]+)"/);
                if (!hrefMatch) return;
                const href = fixUrl(hrefMatch[1]);
                
                // Kotlin: li.selectFirst("img.lazy")!!.attr("data-src")
                const epThumbMatch = epHtml.match(/<img[^>]*class="[^"]*lazy[^"]*"[^>]*data-src="([^"]+)"/);
                const epThumb = epThumbMatch ? fixUrl(epThumbMatch[1]) : null;
                
                // Kotlin: li.selectFirst(".episodiotitle a")!!.text()
                const nameMatch = epHtml.match(/<div[^>]*class="[^"]*episodiotitle[^"]*".*?<a[^>]*>(.*?)<\/a>/s);
                const name = nameMatch ? nameMatch[1].trim() : "Episodio";
                
                // Kotlin: li.selectFirst(".numerando")!!.text().replace(Regex("(S|E)"), "")
                const numMatch = epHtml.match(/<div[^>]*class="[^"]*numerando[^"]*"[^>]*>(.*?)<\/div>/s);
                if (numMatch) {
                    const numText = numMatch[1].trim().replace(/[SE]/g, '');
                    const parts = numText.split('-').map(p => parseInt(p.trim())).filter(n => !isNaN(n));
                    const season = parts.length === 2 ? parts[0] : null;
                    const episode = parts.length === 2 ? parts[1] : null;
                    
                    episodes.push(new Episode({
                        title: name,
                        url: href,
                        season: season,
                        episode: episode,
                        posterUrl: epThumb && !epThumb.includes("svg") ? epThumb : null
                    }));
                }
            });

            // Kotlin: val tvType = if (url.contains("/ver-pelicula/")) TvType.Movie else TvType.TvSeries
            const isSeries = episodes.length > 0 || url.includes("/ver-serie/");
            
            const item = new MultimediaItem({
                title: title,
                url: url,
                type: isSeries ? "series" : "movie",
                description: description,
                posterUrl: poster,
                episodes: episodes
            });

            cb({ success: true, data: item });
        } catch (error) {
            cb({ success: false, message: `[${TAG}] load error: ${error.message}` });
        }
    }

    // ========== STREAMS DE VIDEO ==========
    // Portado de: override suspend fun loadLinks(data: String, ...)
    
    async function loadStreams(url, cb) {
        try {
            const response = await fetch(url);
            const html = await response.text();

            const streams = [];

            // Kotlin: app.get(data).document.select(".linklist ul li").amap { ... }
            const linkPattern = /<li[^>]*data-option="([^"]+)"/gs;
            const links = extractItems(html, linkPattern);

            for (const linkMatch of links) {
                try {
                    // Kotlin: val url = it.select("li").attr("data-option")
                    // Kotlin: loadExtractor(fixHostsLinks(url), mainUrl, ...)
                    const videoUrl = fixHostsLinks(linkMatch[1]);
                    
                    streams.push(new StreamResult({
                        url: videoUrl,
                        quality: "Auto",
                        type: videoUrl.includes(".m3u8") ? "hls" : "mp4"
                    }));
                } catch (e) {
                    continue;
                }
            }

            cb({ success: true, data: streams });
        } catch (error) {
            cb({ success: false, message: `[${TAG}] loadStreams error: ${error.message}` });
        }
    }

    // ========== EXPORTAR FUNCIONES ==========
    
    globalThis.getHome = getHome;
    globalThis.search = search;
    globalThis.load = load;
    globalThis.loadStreams = loadStreams;
})();

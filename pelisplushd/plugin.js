/**
 * PelisplusHD Provider para SkyStream
 * Portado COMPLETO desde CloudStream Storm Extensions (Kotlin)
 * Código original: https://github.com/Stormunblessed/storm-ext/PelisplusHDProvider
 * URL: https://pelisplushd.bz
 */

(function () {
    const TAG = "PelisplusHD";
    const baseUrl = manifest.baseUrl || "https://pelisplushd.bz";

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

    function fetchUrls(text) {
        if (!text) return [];
        const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/g;
        const matches = text.match(linkRegex) || [];
        return matches.map(url => url.trim().replace(/^"|`$"/g, ''));
    }

    function fixHostsLinks(url) {
        return url
            .replace("https://hglink.to", "https://streamwish.to")
            .replace("https://swdyu.com", "https://streamwish.to")
            .replace("https://cybervynx.com", "https://streamwish.to")
            .replace("https://dumbalag.com", "https://streamwish.to")
            .replace("https://mivalyo.com", "https://vidhidepro.com")
            .replace("https://dinisglows.com", "https://vidhidepro.com")
            .replace("https://filemoon.link", "https://filemoon.sx")
            .replace("https://sblona.com", "https://watchsb.com")
            .replace("https://lulu.st", "https://lulustream.com")
            .replace("https://uqload.io", "https://uqload.com")
            .replace("https://do7go.com", "https://dood.la");
    }

    // ========== PÁGINA PRINCIPAL ==========
    // Portado de: override suspend fun getMainPage(page: Int, request: MainPageRequest)
    
    async function getHome(cb) {
        try {
            const response = await fetch(baseUrl);
            const html = await response.text();

            // Kotlin: mapOf("Películas" to "#default-tab-1", "Series" to "#default-tab-2", ...)
            const sections = [
                { id: "#default-tab-1", name: "Películas" },
                { id: "#default-tab-2", name: "Series" },
                { id: "#default-tab-3", name: "Anime" },
                { id: "#default-tab-4", name: "Doramas" }
            ];

            const homeData = [];

            for (const section of sections) {
                try {
                    // Kotlin: document.select(it.value).select("a.Posters-link")
                    const sectionRegex = new RegExp(`${section.id.replace('#', '\\#')}[^]*?<\\/div>`, 's');
                    const sectionMatch = html.match(sectionRegex);
                    
                    if (!sectionMatch) continue;
                    
                    const sectionHtml = sectionMatch[0];
                    const itemPattern = /<a[^>]*class="[^"]*Posters-link[^"]*"[^>]*>(.*?)<\/a>/gs;
                    const items = extractItems(sectionHtml, itemPattern);

                    const mediaItems = items.map(match => {
                        const itemHtml = match[1];
                        const fullMatch = match[0];
                        
                        // Kotlin: this.select(".listing-content p").text()
                        const titleMatch = itemHtml.match(/<p[^>]*class="[^"]*listing-content[^"]*"[^>]*>(.*?)<\/p>/s);
                        const title = titleMatch ? titleMatch[1].trim() : "Sin título";
                        
                        // Kotlin: this.select("a").attr("href")
                        const hrefMatch = fullMatch.match(/href="([^"]+)"/);
                        const href = hrefMatch ? fixUrl(hrefMatch[1]) : "";
                        
                        // Kotlin: fixUrl(this.select(".Posters-img").attr("src"))
                        const posterMatch = itemHtml.match(/<img[^>]*class="[^"]*Posters-img[^"]*"[^>]*src="([^"]+)"/);
                        const posterUrl = posterMatch ? fixUrl(posterMatch[1]) : null;
                        
                        // Kotlin: val isMovie = href.contains("/pelicula/")
                        const isMovie = href.includes("/pelicula/");
                        
                        return new MultimediaItem({
                            title: title,
                            url: href,
                            type: isMovie ? "movie" : "series",
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
            const url = `${baseUrl}/search?s=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            const html = await response.text();

            // Kotlin: document.select("a.Posters-link")
            const itemPattern = /<a[^>]*class="[^"]*Posters-link[^"]*"[^>]*>(.*?)<\/a>/gs;
            const items = extractItems(html, itemPattern);

            const results = items.map(match => {
                const itemHtml = match[1];
                const fullMatch = match[0];
                
                // Kotlin: it.selectFirst(".listing-content p")!!.text()
                const titleMatch = itemHtml.match(/<p[^>]*class="[^"]*listing-content[^"]*"[^>]*>(.*?)<\/p>/s);
                const title = titleMatch ? titleMatch[1].trim() : "Sin título";
                
                // Kotlin: it.selectFirst("a")!!.attr("href")
                const hrefMatch = fullMatch.match(/href="([^"]+)"/);
                const href = hrefMatch ? fixUrl(hrefMatch[1]) : "";
                
                // Kotlin: it.selectFirst(".Posters-img")?.attr("src")
                const posterMatch = itemHtml.match(/<img[^>]*class="[^"]*Posters-img[^"]*"[^>]*src="([^"]+)"/);
                const image = posterMatch ? fixUrl(posterMatch[1]) : null;
                
                const isMovie = href.includes("/pelicula/");
                
                return new MultimediaItem({
                    title: title,
                    url: href,
                    type: isMovie ? "movie" : "series",
                    posterUrl: image
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
            const response = await fetch(url);
            const html = await response.text();

            // Kotlin: soup.selectFirst(".m-b-5")?.text()
            const titleMatch = html.match(/<div[^>]*class="[^"]*m-b-5[^"]*"[^>]*>(.*?)<\/div>/s);
            const title = titleMatch ? titleMatch[1].trim().replace(/<[^>]*>/g, '') : "Sin título";

            // Kotlin: soup.selectFirst("div.text-large")?.text()?.trim()
            const descMatch = html.match(/<div[^>]*class="[^"]*text-large[^"]*"[^>]*>(.*?)<\/div>/s);
            const description = descMatch ? descMatch[1].trim().replace(/<[^>]*>/g, '') : null;

            // Kotlin: soup.selectFirst(".img-fluid")?.attr("src")
            const posterMatch = html.match(/<img[^>]*class="[^"]*img-fluid[^"]*"[^>]*src="([^"]+)"/);
            const poster = posterMatch ? fixUrl(posterMatch[1]) : null;

            // Kotlin: soup.selectFirst(".p-r-15 .text-semibold")?.text()?.toIntOrNull()
            const yearMatch = html.match(/<div[^>]*class="[^"]*p-r-15[^"]*".*?<span[^>]*class="[^"]*text-semibold[^"]*"[^>]*>(\d{4})<\/span>/s);
            const year = yearMatch ? parseInt(yearMatch[1]) : null;

            // Kotlin: soup.select(".p-h-15.text-center a span.font-size-18.text-info.text-semibold")
            let tags = [];
            const tagPattern = /<span[^>]*class="[^"]*font-size-18[^"]*text-info[^"]*text-semibold[^"]*"[^>]*>(.*?)<\/span>/gs;
            const tagMatches = extractItems(html, tagPattern);
            tags = tagMatches.map(m => m[1].trim().replace(/, /g, '')).filter(t => t);

            // Kotlin: soup.select("div.tab-pane .btn")
            const episodes = [];
            const tabPanePattern = /<div[^>]*class="[^"]*tab-pane[^"]*"[^>]*>(.*?)<\/div>/gs;
            const tabPanes = extractItems(html, tabPanePattern);
            
            tabPanes.forEach(paneMatch => {
                const paneHtml = paneMatch[1];
                const btnPattern = /<div[^>]*class="[^"]*btn[^"]*"[^>]*>(.*?)<\/div>/gs;
                const buttons = extractItems(paneHtml, btnPattern);
                
                buttons.forEach(btnMatch => {
                    const btnHtml = btnMatch[1];
                    
                    // Kotlin: li.selectFirst("a")?.attr("href")
                    const epHrefMatch = btnHtml.match(/<a[^>]*href="([^"]+)"/);
                    if (!epHrefMatch) return;
                    
                    const href = fixUrl(epHrefMatch[1]);
                    
                    // Kotlin: li.selectFirst(".btn-primary.btn-block")?.text()?.replace(Regex("(T(\\d+).*E(\\d+):)"), "")?.trim()
                    const epNameMatch = btnHtml.match(/<div[^>]*class="[^"]*btn-primary[^"]*btn-block[^"]*"[^>]*>(.*?)<\/div>/s);
                    let name = epNameMatch ? epNameMatch[1].trim().replace(/<[^>]*>/g, '').replace(/T\d+.*E\d+:/g, '').trim() : "Episodio";
                    
                    // Kotlin: val seasoninfo = href?.substringAfter("temporada/")?.replace("/capitulo/", "-")
                    const seasonInfoMatch = href.match(/temporada\/(\d+)\/capitulo\/(\d+)/);
                    const season = seasonInfoMatch ? parseInt(seasonInfoMatch[1]) : null;
                    const episode = seasonInfoMatch ? parseInt(seasonInfoMatch[2]) : null;
                    
                    episodes.push(new Episode({
                        title: name,
                        url: href,
                        season: season,
                        episode: episode
                    }));
                });
            });

            // Kotlin: val tvType = if (url.contains("/pelicula/")) TvType.Movie else TvType.TvSeries
            const isSeries = episodes.length > 0;
            
            const item = new MultimediaItem({
                title: title,
                url: url,
                type: isSeries ? "series" : "movie",
                description: description,
                posterUrl: poster,
                releaseDate: year,
                genres: tags,
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

            // Kotlin: app.get(data).document.select("script").firstOrNull { it.html().contains("var video = [];") }
            const scriptMatch = html.match(/<script[^>]*>(.*?var video = \[\];.*?)<\/script>/s);
            
            if (scriptMatch) {
                const scriptContent = scriptMatch[1];
                // Kotlin: fetchUrls(script)
                const videoUrls = fetchUrls(scriptContent);
                
                for (const videoUrl of videoUrls) {
                    try {
                        if (videoUrl.includes("embed69.org")) {
                            // Kotlin: Embed69Extractor.load(it, data, ...)
                            const embedResp = await fetch(videoUrl);
                            const embedHtml = await embedResp.text();
                            const m3u8Match = embedHtml.match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/);
                            if (m3u8Match) {
                                streams.push(new StreamResult({
                                    url: m3u8Match[0],
                                    quality: "HD",
                                    type: "hls"
                                }));
                            }
                        } else if (videoUrl.includes("xupalace.org/video")) {
                            // Kotlin: val regex = """(go_to_player|go_to_playerVast)\('(.*?)'""".toRegex()
                            const xupResp = await fetch(videoUrl);
                            const xupHtml = await xupResp.text();
                            const playerRegex = /(go_to_player|go_to_playerVast)\('([^']+)'/gs;
                            const playerMatches = extractItems(xupHtml, playerRegex);
                            
                            for (const pm of playerMatches) {
                                // Kotlin: loadExtractor(fixHostsLinks(it), data, ...)
                                const playerUrl = fixHostsLinks(pm[2]);
                                streams.push(new StreamResult({
                                    url: playerUrl,
                                    quality: "SD",
                                    type: playerUrl.includes(".m3u8") ? "hls" : "mp4"
                                }));
                            }
                        } else {
                            // Kotlin: app.get(it).document.selectFirst("iframe")?.attr("src")
                            const otherResp = await fetch(videoUrl);
                            const otherHtml = await otherResp.text();
                            const iframeMatch = otherHtml.match(/<iframe[^>]*src="([^"]+)"/);
                            if (iframeMatch) {
                                const iframeUrl = fixHostsLinks(iframeMatch[1]);
                                streams.push(new StreamResult({
                                    url: iframeUrl,
                                    quality: "Auto",
                                    type: iframeUrl.includes(".m3u8") ? "hls" : "mp4"
                                }));
                            }
                        }
                    } catch (e) {
                        continue;
                    }
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

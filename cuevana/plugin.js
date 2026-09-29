/**
 * Cuevana Provider para SkyStream
 * Portado COMPLETO desde CloudStream Storm Extensions (Kotlin)
 * Código original: https://github.com/Stormunblessed/storm-ext/CuevanaProvider
 * URL: https://wv3.cuevana3.eu
 */

(function () {
    const TAG = "Cuevana";
    const baseUrl = manifest.baseUrl || "https://wv3.cuevana3.eu";

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

    function extractFirst(html, pattern) {
        const regex = new RegExp(pattern, 's');
        const match = html.match(regex);
        return match ? match[1] : null;
    }

    function fixUrl(url) {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        if (url.startsWith("//")) return "https:" + url;
        if (url.startsWith("/")) return baseUrl + url;
        return url.replace(/^\//, baseUrl + "/");
    }

    function resolvePoster(url) {
        if (!url) return null;
        if (url.includes("/_next/image?url=")) {
            try {
                const encoded = url.split("url=")[1].split("&")[0];
                return decodeURIComponent(encoded);
            } catch (e) {
                return url;
            }
        }
        return fixUrl(url);
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
    // Portado de: override suspend fun getMainPage(page: Int, request: MainPageRequest)
    
    async function getHome(cb) {
        try {
            const sections = [
                { path: "peliculas/page/1", name: "Películas actualizadas" },
                { path: "peliculas/estrenos/page/1", name: "Películas Estrenos" },
                { path: "series/page/1", name: "Series actualizadas" },
                { path: "series/estrenos/page/1", name: "Series Estrenos" }
            ];

            const homeData = [];

            for (const section of sections) {
                try {
                    const url = `${baseUrl}/${section.path}`;
                    const response = await fetch(url);
                    const html = await response.text();

                    // Kotlin: soup.select("section li.TPostMv")
                    const itemPattern = /<li[^>]*class="[^"]*TPostMv[^"]*"[^>]*>(.*?)<\/li>/gs;
                    const items = extractItems(html, itemPattern);

                    const mediaItems = items.map(match => {
                        const itemHtml = match[1];
                        
                        // Kotlin: it.selectFirst("span.Title")?.text()
                        const titleMatch = itemHtml.match(/<span[^>]*class="[^"]*Title[^"]*"[^>]*>(.*?)<\/span>/s);
                        const title = titleMatch ? titleMatch[1].trim() : "Sin titulo";
                        
                        // Kotlin: it.selectFirst("a")?.attr("href")
                        const linkMatch = itemHtml.match(/<a[^>]*href="([^"]+)"/);
                        let link = linkMatch ? linkMatch[1] : "";
                        link = link.replace(/^\//, baseUrl + "/");
                        
                        // Kotlin: it.selectFirst("img")?.attr("src").resolvePoster()
                        const posterMatch = itemHtml.match(/<img[^>]*src="([^"]+)"/);
                        const posterUrl = posterMatch ? resolvePoster(posterMatch[1]) : null;
                        
                        // Kotlin: if (link.contains("/pelicula/")) TvType.Movie else TvType.TvSeries
                        const isMovie = link.includes("/pelicula/");
                        
                        return new MultimediaItem({
                            title: title,
                            url: link,
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
            const url = `${baseUrl}/search?q=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            const html = await response.text();

            // Kotlin: document.select("li.TPostMv")
            const itemPattern = /<li[^>]*class="[^"]*TPostMv[^"]*"[^>]*>(.*?)<\/li>/gs;
            const items = extractItems(html, itemPattern);

            const results = items.map(match => {
                const itemHtml = match[1];
                
                // Kotlin: it.selectFirst("span.Title")!!.text()
                const titleMatch = itemHtml.match(/<span[^>]*class="[^"]*Title[^"]*"[^>]*>(.*?)<\/span>/s);
                const title = titleMatch ? titleMatch[1].trim() : "Sin titulo";
                
                // Kotlin: it.selectFirst("a")!!.attr("href").replace("^/".toRegex(), "$mainUrl/")
                const hrefMatch = itemHtml.match(/<a[^>]*href="([^"]+)"/);
                let href = hrefMatch ? hrefMatch[1] : "";
                href = href.replace(/^\//, baseUrl + "/");
                
                // Kotlin: it.selectFirst("img")!!.attr("src").resolvePoster()
                const posterMatch = itemHtml.match(/<img[^>]*src="([^"]+)"/);
                const image = posterMatch ? resolvePoster(posterMatch[1]) : null;
                
                const isSerie = href.includes("/serie/");
                
                return new MultimediaItem({
                    title: title,
                    url: href,
                    type: isSerie ? "series" : "movie",
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
            const response = await fetch(url, { timeout: 120000 });
            const html = await response.text();

            // Kotlin: soup.selectFirst(".m-b-5")?.text()
            const titleMatch = html.match(/<h1[^>]*class="[^"]*Title[^"]*"[^>]*>(.*?)<\/h1>/s);
            const title = titleMatch ? titleMatch[1].trim() : null;
            
            if (!title) {
                throw new Error("No se encontró el título");
            }

            // Kotlin: soup.selectFirst(".Description p")?.text()
            const descMatch = html.match(/<div[^>]*class="[^"]*Description[^"]*"[^>]*>.*?<p[^>]*>(.*?)<\/p>/s);
            const description = descMatch ? descMatch[1].trim().replace(/<[^>]*>/g, '') : null;

            // Kotlin: soup.selectFirst(".img-fluid")?.attr("src")
            const posterMatch = html.match(/<div[^>]*class="[^"]*backdrop[^"]*".*?<img[^>]*src="([^"]+)"/s);
            const poster = posterMatch ? resolvePoster(posterMatch[1]) : null;

            // Kotlin: soup.selectFirst(".Image:nth-child(2) img")?.attr("src")
            const bgMatch = html.match(/<div[^>]*class="[^"]*Image[^"]*"[^>]*>.*?<img[^>]*src="([^"]+)"/s);
            const backgroundposter = bgMatch ? resolvePoster(bgMatch[1]) : poster;

            // Kotlin: yearRegex.find(year1)
            const yearMatch = html.match(/<footer[^>]*>.*?<span>(\d{4})<\/span>/s);
            const year = yearMatch ? parseInt(yearMatch[1]) : null;

            // Kotlin: soup.select("ul.InfoList li.AAIco-adjust:contains(Genero) a")
            let tags = [];
            const genreSection = html.match(/<li[^>]*class="[^"]*AAIco-adjust[^"]*"[^>]*>[^<]*Genero.*?<\/li>/s);
            if (genreSection) {
                const genrePattern = /<a[^>]*>(.*?)<\/a>/gs;
                const genreMatches = extractItems(genreSection[0], genrePattern);
                tags = genreMatches.map(m => m[1].trim());
            }

            // Kotlin: soup.select("script#__NEXT_DATA__")
            const episodes = [];
            const scriptMatch = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
            
            if (scriptMatch) {
                try {
                    const jsonData = JSON.parse(scriptMatch[1]);
                    const seasons = jsonData?.props?.pageProps?.thisSerie?.seasons || [];
                    
                    // Kotlin: seasons.flatMap { season -> season.episodes.amap { ... } }
                    seasons.forEach(season => {
                        season.episodes.forEach(ep => {
                            // Kotlin: it.url.slug.replace("series/", "$mainUrl/serie/").replace("seasons/", "temporada/").replace("episodes/", "episodio/")
                            const epSlug = ep.url.slug
                                .replace("series/", "")
                                .replace("seasons/", "temporada/")
                                .replace("episodes/", "episodio/");
                            const epUrl = `${baseUrl}/serie/${epSlug}`;
                            
                            episodes.push(new Episode({
                                title: ep.title,
                                url: epUrl,
                                season: season.number,
                                episode: ep.number,
                                posterUrl: ep.image || poster
                            }));
                        });
                    });
                } catch (e) {
                    // JSON parsing failed, continue without episodes
                }
            }

            // Kotlin: soup.selectFirst("div.TPlayer.embed_div div[id=OptY] iframe")?.attr("data-src")
            const trailerMatch = html.match(/<div[^>]*class="[^"]*TPlayer[^"]*".*?<iframe[^>]*data-src="([^"]+)"/s);
            const trailer = trailerMatch ? trailerMatch[1] : "";

            // Kotlin: val tvType = if (episodes == null || episodes.isEmpty()) TvType.Movie else TvType.TvSeries
            const isSeries = episodes.length > 0;
            
            const item = new MultimediaItem({
                title: title,
                url: url,
                type: isSeries ? "series" : "movie",
                description: description,
                posterUrl: poster,
                backgroundUrl: backgroundposter,
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

            // Kotlin: app.get(data).document.select("li.open_submenu")
            const serverPattern = /<li[^>]*class="[^"]*open_submenu[^"]*"[^>]*>(.*?)<\/li>/gs;
            const servers = extractItems(html, serverPattern);

            for (const serverMatch of servers) {
                const serverHtml = serverMatch[1];
                
                // Kotlin: val languaje = it.text().trim().replaceFirst(" L", "_L").substringBefore(" ")
                const langMatch = serverHtml.match(/>(.*?)</);
                const language = langMatch ? langMatch[1].trim().split(" ")[0] : "Latino";

                // Kotlin: it.select("li.clili").amap { ... }
                const iframePattern = /<li[^>]*class="[^"]*clili[^"]*"[^>]*data-tr="([^"]+)"/gs;
                const iframes = extractItems(serverHtml, iframePattern);

                for (const iframeMatch of iframes) {
                    // Kotlin: val iframe = fixUrl(it.attr("data-tr"))
                    const iframe = fixUrl(iframeMatch[1]);
                    
                    try {
                        // Kotlin: app.get(iframe).document.select("script").firstOrNull { it.html().contains("var url = '") }
                        const iframeResp = await fetch(iframe);
                        const iframeHtml = await iframeResp.text();

                        // Kotlin: ?.substringAfter("var url = '")?.substringBefore("';")
                        const videoMatch = iframeHtml.match(/var url = '([^']+)'/);
                        if (videoMatch) {
                            // Kotlin: loadSourceNameExtractor(languaje, fixHostsLinks(it), ...)
                            const videoUrl = fixHostsLinks(videoMatch[1]);
                            
                            streams.push(new StreamResult({
                                url: videoUrl,
                                quality: `${language}`,
                                type: videoUrl.includes(".m3u8") ? "hls" : "mp4"
                            }));
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

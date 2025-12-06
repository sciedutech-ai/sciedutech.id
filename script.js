// === FETCH BERITA SAINS (SciTechDaily) ===
fetch("https://www.scitechdaily.com/feed/")
    .then(res => res.text())
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => {
        let items = data.querySelectorAll("item");
        let container = document.getElementById("science-news");

        container.innerHTML = "";
        items.forEach((item, i) => {
            if (i < 5) {
                container.innerHTML += `
                    <a href="${item.querySelector("link").textContent}" target="_blank">
                        ${item.querySelector("title").textContent}
                    </a>
                `;
            }
        });
    });


// === FETCH BERITA KRIPTO (Investing.com) ===
fetch("https://rss.app/feeds/X1J0tElQxX6tDla3.xml") // RSS mirror
    .then(res => res.text())
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => {
        let items = data.querySelectorAll("item");
        let container = document.getElementById("crypto-news");

        container.innerHTML = "";
        items.forEach((item, i) => {
            if (i < 5) {
                container.innerHTML += `
                    <a href="${item.querySelector("link").textContent}" target="_blank">
                        ${item.querySelector("title").textContent}
                    </a>
                `;
            }
        });
    });


// === FETCH BERITA TEKNOLOGI (NVIDIA) ===
fetch("https://nvidianews.nvidia.com/news?format=xml")
    .then(res => res.text())
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => {
        let items = data.querySelectorAll("item");
        let container = document.getElementById("tech-news");

        container.innerHTML = "";
        items.forEach((item, i) => {
            if (i < 5) {
                container.innerHTML += `
                    <a href="${item.querySelector("link").textContent}" target="_blank">
                        ${item.querySelector("title").textContent}
                    </a>
                `;
            }
        });
    });

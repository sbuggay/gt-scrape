import * as cheerio from "cheerio";
import * as rp from "request-promise";

const mapping = [
    "rank",
    "",
    "name",
    "players",
    "",
    "",
    "ip",
    "map"
]

function transform(data) {
    if (data.length !== 8) {
        return {};
    }

    const obj = {};

    data.forEach((d, i) => {
        if (mapping[i]) {
            switch (mapping[i]) {
                default:
                    obj[mapping[i]] = d;
            }
        }
    });

    return obj;
}

// <a href="/search/cs/?searchpge=2#search">NEXT</a>

function scrape() {

    let scrapping = true;
    const url = "https://www.gametracker.com/search/cs/US/?searchipp=50#search";

    const options = {
        uri: url,
        transform: (body) => { console.log(body); return cheerio.load(body) },
        headers: {
            "User-Agent": "request"
        }
    };

    rp(options).then($ => {
        const nextLink = $("a:contains('NEXT')").attr("href");
        $("tr").each((i, el) => {
            const data = [];
            $(el).find("td").each((i, td) => {
                data.push($(td).text().replace(/\n?\t?/g, ""));
            });
            console.log(transform(data));
        });
    }).catch(error => {
        console.error(error);
    });
}

scrape();


// "0": "1934.",
// "1": "",
// "2": "[pDx] PUG [1] Competitive Miami <paradoxteam.ORG>",
// "3": "11/13",
// "4": "",
// "5": "",
// "6": "45.32.175.47:27030",
// "7": "de_train",
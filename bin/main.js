"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = require("cheerio");
const rp = require("request-promise");
const fs = require("fs");
const json2csv = require("json2csv");
// The mapping order and positions
const mapping = [
    "rank",
    "",
    "name",
    "players",
    "",
    "",
    "ip",
    "map"
];
// Transform a row into an object
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
const data = [];
function scrape() {
    return new Promise((resolve, reject) => {
        function recurse(url, host = "https://www.gametracker.com") {
            let scrapping = true;
            const options = {
                uri: host + url,
                transform: (body) => cheerio.load(body),
                headers: {
                    "User-Agent": "request"
                }
            };
            rp(options).then($ => {
                const nextLink = $("a:contains('NEXT')").attr("href");
                $("tr").each((i, el) => {
                    const row = [];
                    $(el).find("td").each((i, td) => {
                        row.push($(td).text().replace(/\n?\t?/g, ""));
                    });
                    data.push(transform(row));
                });
                if (nextLink) {
                    // Recurse, note that this isn't true recursion. As the call stack gets broken up by the promise message queue.
                    recurse(nextLink);
                }
                else {
                    resolve(data);
                }
            }).catch(error => {
                console.error(error);
                reject(error);
            });
        }
        recurse("/search/cs/US/?searchipp=50#search");
    });
}
scrape().then(result => {
    const fields = ["rank", "name", "players", "ip", "map"];
    const csv = json2csv({ data: result, fields: fields });
    fs.writeFileSync("out.csv", csv);
});
//# sourceMappingURL=main.js.map
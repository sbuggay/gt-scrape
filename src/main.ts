import * as cheerio from "cheerio";
import * as rp from "request-promise";
import * as fs from "fs";

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
function transform(data: string[]) {

    if (data.length !== 8) {
        return {};
    }

    const obj: { [key: string]: any } = {};

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

const data: any[] = [];

function scrape(): Promise<any> {

    //return new Promise((resolve, reject) => {
        function recurse(url: string, host: string = "https://www.gametracker.com"): any {

            let scrapping = true;

            console.log(host + url);

            const options = {
                uri: host + url,
                transform: (body: any) => cheerio.load(body),
                headers: {
                    "User-Agent": "request"
                }
            };

            return rp(options).then($ => {
                const nextLink = $("a:contains('NEXT')").attr("href");
                $("tr").each((i: number, el: any) => {
                    const row: any[] = [];
                    $(el).find("td").each((i: number, td: any) => {
                        row.push($(td).text().replace(/\n?\t?/g, ""));
                    });
                    data.push(transform(row));
                });

                if (nextLink) {
                    // Recurse, note that this isn't true recursion. As the call stack gets broken up by the promise message queue.
                    return recurse(nextLink);
                }
            });
        //}
    };

    return recurse("/search/cs/?searchipp=50&sort=0&order=ASC");
}

scrape().then(result => {
    const fields = ["rank", "name", "players", "ip", "map"];
    const csv = json2csv({ data: result, fields: fields });
    fs.writeFileSync("out.csv", csv);
});
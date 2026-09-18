"use strict";
// import dotenv from 'dotenv'
// dotenv.config()
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./scripts/utils/index");
const charts_1 = require("./scripts/server/charts");
const calendar_1 = require("./scripts/server/calendar");
const news_1 = require("./scripts/server/news");
const contacts_1 = require("./scripts/server/contacts");
async function main() {
    const modules = [
        'გრაფიკები',
        'კალენდარი',
        'სიახლეები',
        'კონტაქტი',
    ];
    modules.map((entry, i) => {
        console.log(`${[i]}.${entry}`);
    });
    const answer = await (0, index_1.Input)('არჩევანი', Number);
    switch (answer) {
        case 0:
            await new charts_1.Charts().Init();
            break;
        case 1:
            await new calendar_1.Calendar().Init();
            break;
        case 2:
            await new news_1.News().Init();
            break;
        case 3:
            await new contacts_1.Contact().Init();
            break;
        default:
            console.log('არასწორი არჩევანი');
            break;
    }
}
main();
//# sourceMappingURL=index.js.map
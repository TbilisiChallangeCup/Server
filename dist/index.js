"use strict";
// import dotenv from 'dotenv'
// dotenv.config()
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { Calendar } from "./scripts/server/calendar";
// const calendar = new Calendar().Init();
// console.log(calendar)
const index_1 = require("./scripts/utils/index");
const sharp_1 = __importDefault(require("sharp"));
async function TeamIcon() {
    const buffer = await (0, sharp_1.default)('/home/zee/Wallpapers/1MOWNwR.jpeg').resize(200).toBuffer();
    const base64 = buffer.toString('base64');
    // const dataUri = `data:image/jpeg;base64,${base64}`
    const res = await index_1.octokit.rest.repos.createOrUpdateFileContents({
        owner: index_1.owner,
        repo: index_1.repo,
        path: `images/calendar-${Date.now()}.jpg`,
        content: base64,
        message: 'ფოტოს ატვირთვა',
    });
    return res;
}
TeamIcon();
//# sourceMappingURL=index.js.map
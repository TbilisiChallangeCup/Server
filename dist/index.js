"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const calendar_1 = require("./scripts/server/calendar");
const calendar = new calendar_1.Calendar().Init();
//# sourceMappingURL=index.js.map
import {homedir} from 'node:os';
import {join} from 'node:path';
let playwright;
try{playwright=await import(process.env.PLAYWRIGHT_MODULE||'playwright');}catch{playwright=await import(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));}
export const chromium=playwright.chromium;
export const executablePath=process.env.CHROME_PATH||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined);

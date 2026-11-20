#!/usr/bin/env node
/* 밤의 목장 — 프로젝트 지도 (설치할 것 없음)
   코드를 통째로 읽지 않고 "어느 파일 몇째 줄에 무엇이 있는지"만 보려고 만든 도구입니다.
   (사람도, AI도 — 큰 파일을 읽는 대신 이걸로 위치를 찾은 뒤 필요한 줄만 읽으면 시간·토큰이 크게 줄어듭니다)

   실행:  node tools/map.mjs                 파일 목록 + 크기 + 한 줄 설명 (불러오는 순서대로)
          node tools/map.mjs flow            그 파일의 구역(═ 배너)과 함수 목록(줄 번호 포함)
          node tools/map.mjs 함수이름         그 이름이 어디서 정의되고 어디서 쓰이는지
   index.html의 <script>·<link> 순서를 그대로 따르므로 파일을 추가하면 저절로 반영됩니다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const html = read('index.html');
const js = [...html.matchAll(/<script src="(js\/[^"]+)"><\/script>/g)].map(m => m[1]);
const css = [...html.matchAll(/<link rel="stylesheet" href="(css\/[^"]+)"/g)].map(m => m[1]);
const server = fs.existsSync(path.join(ROOT, 'api')) ? [...fs.readdirSync(path.join(ROOT, 'api')).map(f => 'api/' + f), 'lib/server.mjs'] : [];
const arg = process.argv[2];

const lines = p => read(p).split('\n');
/* 파일 첫 주석의 첫 줄에서 "— 파일명 : 설명" 부분만 */
const about = p => { const m = (lines(p)[0] || '').match(/:\s*(.+?)\s*(\*\/)?$/); return m ? m[1] : ''; };
const kb = p => (fs.statSync(path.join(ROOT, p)).size / 1024).toFixed(0) + 'KB';

function fileDetail(p) {
    console.log(`\n${p}  (${lines(p).length}줄, ${kb(p)})\n  ${about(p)}\n`);
    lines(p).forEach((l, i) => {
        const banner = l.match(/^\s*\/\*\s*[═=]{3,}\s*$/) ? (lines(p)[i + 1] || '').trim() : null;
        if (banner) console.log(`  ${String(i + 2).padStart(5)}  § ${banner.replace(/^\/?\*?\s*/, '')}`);
        const f = l.match(/^(?:async\s+)?function\s+([\w$]+)\s*\(/);
        if (f) console.log(`  ${String(i + 1).padStart(5)}    ${f[1]}()`);
        const c = l.match(/^const\s+([A-Z][A-Z0-9_]+)\s*=/);
        if (c) console.log(`  ${String(i + 1).padStart(5)}    ${c[1]}`);
    });
}

function whereIs(name) {
    const re = new RegExp(`(?<![\\w$.])${name.replace(/[$]/g, '\\$')}(?![\\w$])`);
    let found = false;
    for (const p of [...js, ...css, ...server, 'index.html', 'sw.js']) {
        if (!fs.existsSync(path.join(ROOT, p))) continue;
        const hits = [];
        lines(p).forEach((l, i) => { if (re.test(l)) hits.push(i + 1); });
        if (!hits.length) continue;
        found = true;
        const def = lines(p).findIndex(l => new RegExp(`^(?:async\\s+)?function\\s+${name}\\b|^(?:const|let|var)\\s+${name}\\b`).test(l));
        console.log(`${p}: ${hits.slice(0, 12).join(', ')}${hits.length > 12 ? ' …' : ''}${def >= 0 ? `   ← 정의 ${def + 1}줄` : ''}`);
    }
    if (!found) console.log(`'${name}' 을(를) 찾지 못함`);
}

if (!arg) {
    console.log('불러오는 순서대로 (앞 파일의 것만 파일을 불러오는 즉시 쓸 수 있음)\n');
    for (const p of [...js, ...css, 'sw.js', ...server])
        if (fs.existsSync(path.join(ROOT, p))) console.log(`${p.padEnd(22)} ${String(lines(p).length).padStart(5)}줄 ${kb(p).padStart(6)}  ${about(p)}`);
    console.log('\n자세히: node tools/map.mjs <파일이름 일부>   ·   이름 찾기: node tools/map.mjs <함수이름>');
} else {
    const match = [...js, ...css, ...server, 'sw.js'].filter(p => p.includes(arg));
    if (match.length && match.length <= 3 && !/^[a-z]+[A-Z]/.test(arg)) match.forEach(fileDetail);
    else whereIs(arg);
}

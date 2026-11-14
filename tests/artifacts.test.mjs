import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PNG} from 'pngjs';
import jsQR from 'jsqr';
test('QR generated is independently decodable and contains no private payments',async()=>{const png=PNG.sync.read(await readFile('dist/QR-lote-M01.png'));const result=jsQR(new Uint8ClampedArray(png.data),png.width,png.height);assert.ok(result);assert.match(result.data,/LOTE M01/);assert.doesNotMatch(result.data,/54000|54000|liquidacion|recibo/i);});
test('single HTML has no external scripts, styles, images or font imports',async()=>{const html=await readFile('dist/Tulpa-demo.html','utf8');assert.doesNotMatch(html,/<script[^>]+src=/i);assert.doesNotMatch(html,/<link[^>]+(?:stylesheet|preload)/i);assert.doesNotMatch(html,/<img[^>]+src=["']https?:/i);assert.doesNotMatch(html,/@import\s+["']https?:/i);assert.ok(html.includes('data:image/png;base64,'));});
test('standalone public lot does not ship operator state, storage, or receipts',async()=>{const html=await readFile('dist/lote-M01.html','utf8');assert.doesNotMatch(html,/localStorage|initialState|payments|TULPA-A|54000|<script/i);assert.match(html,/Pendiente de medir/);});

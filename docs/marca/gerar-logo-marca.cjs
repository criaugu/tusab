// Gera a marca do Tusab só com o desenho (Thoth + circuito + TUSAB), fundo transparente e sem a
// frase "Index · Augment · Chat" (do app desktop, descontinuado). Sai do logo redondo
// (logo_*_compact.svg): separa o desenho do fundo, como gerar-icone-quadrado.cjs.
// Usada na tela de entrada da tela do Tusab:
//   node docs/marca/gerar-logo-marca.cjs escuro web_interface/public/marca_escuro.png 640
//   node docs/marca/gerar-logo-marca.cjs claro web_interface/public/marca_claro.png 640
// "escuro" = desenho branco (para fundo escuro); "claro" = desenho escuro (para fundo claro).
// Usa o puppeteer instalado em web_interface/ (dependência do pa11y-ci).
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.join(__dirname, '../../web_interface/node_modules/puppeteer'));

const [tema = 'escuro', saida, tam = '640'] = process.argv.slice(2);
const ALTURA = Number(tam);
const svg = fs.readFileSync(path.join(__dirname, '../../web_interface/public', `logo_${tema === 'escuro' ? 'dark' : 'light'}_compact.svg`), 'utf8');
const src = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');

const html = `<html><body style="margin:0;background:transparent">
<canvas id="c"></canvas>
<script>
const TEMA = ${JSON.stringify(tema)};
const ALTURA = ${ALTURA};
const img = new Image();
img.onload = () => {
  const G = 2048;
  const a = document.createElement('canvas'); a.width = a.height = G;
  const ax = a.getContext('2d');
  ax.drawImage(img, 0, 0, G, G);
  const d = ax.getImageData(0, 0, G, G);
  const p = d.data;
  const lum = (i) => 0.2126 * p[i] + 0.7152 * p[i+1] + 0.0722 * p[i+2];
  let x0 = G, y0 = G, x1 = 0, y1 = 0;
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) {
    const i = (y * G + x) * 4;
    const l = lum(i);
    let al = TEMA === 'escuro' ? (l - 150) / 80 : (110 - l) / 80;
    al = Math.max(0, Math.min(1, al)) * (p[i+3] / 255);
    const v = TEMA === 'escuro' ? 255 : 0x0f;
    p[i] = p[i+1] = p[i+2] = v; p[i+3] = Math.round(al * 255);
    if (al > 0.5) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  ax.putImageData(d, 0, 0);
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const esc = ALTURA / h;
  const c = document.getElementById('c');
  c.width = Math.round(w * esc); c.height = ALTURA;
  const cx = c.getContext('2d');
  cx.imageSmoothingQuality = 'high';
  cx.drawImage(a, x0, y0, w, h, 0, 0, c.width, c.height);
  document.title = c.width + 'x' + c.height;
};
img.src = ${JSON.stringify(src)};
</script></body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 2000, height: ALTURA + 20 });
  await page.setContent(html);
  await page.waitForFunction(() => /^\d+x\d+$/.test(document.title), { timeout: 60000 });
  const el = await page.$('#c');
  await el.screenshot({ path: saida, omitBackground: true });
  console.log('ok', saida, await page.title());
  await browser.close();
})().catch((e) => { console.error(e.message); process.exit(1); });

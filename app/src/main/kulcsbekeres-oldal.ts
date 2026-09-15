/**
 * A kulcsbekérő ablak oldala — lásd `kulcsbekeres.ts`.
 *
 * Önálló HTML, külső fájl és hálózat nélkül: az ablak a program legelején él,
 * amikor még semmi más nincs betöltve. Ezért a betűtípus is a Windows sajátja;
 * a színek a főablak pasztell palettáját követik.
 */

import type { KulcsBekeresOka } from './db/kulcsdontes.js';

const MAGYARAZAT: Record<KulcsBekeresOka, string> = {
  'nincs-tarolt-kulcs':
    'A napló titkosított, de ezen a gépen nincs meg hozzá a kulcs. Ez történik, ha a ' +
    'Windowst újratelepítették, vagy a naplót máshonnan másolták vissza.',
  'olvashatatlan-tarolt-kulcs':
    'A napló titkosított, és a hozzá tárolt kulcsot ez a Windows-fiók nem tudja ' +
    'kinyitni. Ez történik, ha a Windowst újratelepítették, vagy a felhasználói fiók megsérült.',
  'mas-naplo-kulcsa':
    'A napló titkosított, de a gépen tárolt kulcs egy másik naplóhoz tartozik. Ez ' +
    'történik, ha egy korábbi naplót másoltak vissza.',
};

export function kulcsBekeresOldal(ok: KulcsBekeresOka, mentheto: boolean): string {
  const tarolasNelkul = mentheto
    ? ''
    : '<p class="megjegyzes">Ezen a gépen nem érhető el a Windows jelszóvédelme, ezért a ' +
      'kulcsot a program nem tudja eltárolni: minden indításkor be kell majd írnod.</p>';

  return `<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="color-scheme" content="light">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>ÓvodaNapló — a napló kinyitása</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; background: #FEF8FA; color: #3B2A30; }
  body { font: 14px/1.55 "Segoe UI", system-ui, sans-serif; padding: 26px 32px; }
  h1 { font: 600 22px/1.3 Georgia, "Times New Roman", serif; color: #52273A; margin: 0 0 12px; }
  p { margin: 0 0 10px; }
  .kartya { background: #FFFFFF; border: 1px solid #F5D2DC; border-radius: 14px; padding: 18px;
    margin: 16px 0 14px; box-shadow: 0 1px 2px rgba(59, 42, 48, 0.06); }
  label { display: block; font-weight: 600; color: #763A51; margin-bottom: 6px; }
  input { width: 100%; padding: 10px 12px; border: 1px solid #EEB4C4; border-radius: 9px;
    background: #FFFFFF; color: #3B2A30; font: 15px/1.4 Consolas, "Cascadia Mono", monospace;
    text-transform: uppercase; }
  input:focus { outline: 2px solid #D87B9C; outline-offset: 1px; border-color: #D87B9C; }
  .szamlalo { margin-top: 5px; font-size: 12px; color: #A86577; }
  .uzenet { margin-top: 10px; padding: 9px 12px; border-radius: 9px; }
  .uzenet[data-allapot="hiba"] { background: #FBE9EE; color: #8A2E4B; }
  .uzenet[data-allapot="siker"] { background: #E9F5EC; color: #2E6B40; }
  .gombok { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; }
  button { font: 600 14px "Segoe UI", system-ui, sans-serif; padding: 9px 18px; border-radius: 9px;
    border: 1px solid transparent; cursor: pointer; }
  button:disabled { opacity: 0.6; cursor: default; }
  .fo { background: #D87B9C; color: #FFFFFF; }
  .fo:hover:not(:disabled) { background: #BC6182; }
  .masodlagos { background: transparent; color: #763A51; border-color: #EEB4C4; }
  .masodlagos:hover:not(:disabled) { background: #FBE9EE; }
  .megjegyzes { font-size: 12.5px; color: #82505F; }
  code { font: 12.5px Consolas, monospace; background: #FBE9EE; padding: 1px 5px; border-radius: 4px; }
</style>
</head>
<body>
<h1>Kell a visszaállítási kulcs</h1>
<p>${MAGYARAZAT[ok]}</p>
<p>A kulcsot a program akkor adta, amikor a titkosítás bekapcsolt. Egy
<code>OvodaNaplo-visszaallitasi-kulcs</code> kezdetű szövegfájlban van — pendrive-on,
telefonon, vagy kinyomtatva.</p>
<form id="urlap" class="kartya" autocomplete="off" novalidate>
  <label for="kulcs">Visszaállítási kulcs</label>
  <input id="kulcs" type="text" spellcheck="false" autocomplete="off" maxlength="200"
    placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-…" aria-describedby="szamlalo uzenet" autofocus>
  <div class="szamlalo" id="szamlalo">0 / 64 jel</div>
  <div class="uzenet" id="uzenet" role="alert" hidden></div>
  <div class="gombok">
    <button type="button" class="masodlagos" id="kilepes">Kilépés</button>
    <button type="submit" class="fo" id="megnyitas">Napló megnyitása</button>
  </div>
</form>
<p class="megjegyzes">Rossz kulccsal semmi nem változik: a program ilyenkor a naplót csak
olvassa. Ha most nincs kéznél a kulcs, nyugodtan lépj ki — a napló érintetlen marad, és a
következő indításkor újra megpróbálhatod.</p>
${tarolasNelkul}
<script>
  const mezo = document.getElementById('kulcs');
  const szamlalo = document.getElementById('szamlalo');
  const uzenet = document.getElementById('uzenet');
  const megnyitas = document.getElementById('megnyitas');
  const kilepes = document.getElementById('kilepes');

  function mutat(allapot, szoveg) {
    uzenet.dataset.allapot = allapot;
    uzenet.textContent = szoveg;
    uzenet.hidden = false;
  }

  mezo.addEventListener('input', () => {
    szamlalo.textContent = (mezo.value.match(/[0-9a-f]/gi) || []).length + ' / 64 jel';
    uzenet.hidden = true;
  });

  document.getElementById('urlap').addEventListener('submit', async (e) => {
    e.preventDefault();
    megnyitas.disabled = true;
    kilepes.disabled = true;
    megnyitas.textContent = 'Ellenőrzöm…';
    try {
      const valasz = await window.kulcsBekeres.probal(mezo.value);
      if (valasz.siker) {
        mezo.disabled = true;
        megnyitas.textContent = 'Megnyitom…';
        mutat('siker', 'A kulcs helyes. Megnyitom a naplót…');
        return;
      }
      mutat('hiba', valasz.hiba);
    } catch (err) {
      mutat('hiba', 'Váratlan hiba: ' + (err && err.message ? err.message : err));
    }
    megnyitas.disabled = false;
    kilepes.disabled = false;
    megnyitas.textContent = 'Napló megnyitása';
    mezo.focus();
  });

  kilepes.addEventListener('click', () => window.close());
</script>
</body>
</html>`;
}

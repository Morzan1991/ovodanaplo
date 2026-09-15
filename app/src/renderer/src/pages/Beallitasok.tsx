import { useEffect, useState } from 'react';
import type { Beallitas } from '@shared/schema';

export default function Beallitasok() {
  const [b, setB] = useState<Beallitas | null>(null);
  const [verzio, setVerzio] = useState('');
  const [mentve, setMentve] = useState(false);

  useEffect(() => {
    void window.api.beallitasokGet().then((rec) => {
      setB(
        rec ?? {
          id: 0,
          pedagogusNeve: '',
          ovodaNeve: '',
          ovodaCime: '',
          csoportNeve: '',
          csoportTipus: 'vegyes',
          utolsoBackup: null,
          themeAccent: 'osz',
        },
      );
    });
    void window.api.appVerzio().then(setVerzio);
  }, []);

  if (!b) return <div className="p-8 text-center text-ink/50">Betöltés…</div>;

  async function ment() {
    if (!b) return;
    const { id, utolsoBackup, ...mentendo } = b;
    void id;
    void utolsoBackup;
    // Hiba esetén a felhasználó eddig SEMMIT nem látott: a „Mentve" visszajelzés
    // egyszerűen elmaradt, az ok pedig a konzolban ragadt.
    try {
      await window.api.beallitasokSave(mentendo);
      setMentve(true);
      setTimeout(() => setMentve(false), 1500);
    } catch (err) {
      console.error('[Beallitasok] mentés sikertelen:', err);
      alert('A beállítások mentése nem sikerült. Próbáld újra.');
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-6">
      <h1 className="heading-serif text-3xl font-medium mb-1">Beállítások</h1>
      <p className="text-sm text-ink/60 mb-6">
        Ez az adat a generált dokumentumokban (DOCX, PDF) fog megjelenni.
      </p>

      <div className="card space-y-4">
        <Field label="Pedagógus neve" value={b.pedagogusNeve ?? ''} onChange={(v) => setB({ ...b, pedagogusNeve: v })} />
        <Field label="Óvoda neve" value={b.ovodaNeve ?? ''} onChange={(v) => setB({ ...b, ovodaNeve: v })} />
        <Field label="Óvoda címe" value={b.ovodaCime ?? ''} onChange={(v) => setB({ ...b, ovodaCime: v })} />
        <Field label="Csoport neve" value={b.csoportNeve ?? ''} onChange={(v) => setB({ ...b, csoportNeve: v })} />
        <label className="block">
          <span className="field-label block mb-1">Csoport típusa (korcsoport)</span>
          <select
            value={b.csoportTipus ?? 'vegyes'}
            onChange={(e) => setB({ ...b, csoportTipus: e.target.value })}
            className="w-full border border-sage-200 rounded px-3 py-2 text-base"
          >
            <option value="vegyes">Vegyes csoport (3–7 éves)</option>
            <option value="kicsi">Kiscsoport (3–4 éves)</option>
            <option value="kozepso">Középső csoport (4–5 éves)</option>
            <option value="nagy">Nagycsoport (5–7 éves)</option>
          </select>
        </label>

        <button onClick={ment} className="btn-primary">
          {mentve ? '✓ Mentve' : 'Mentés'}
        </button>
      </div>

      <div className="card mt-6">
        <div className="field-label mb-2">Adatok</div>
        <ul className="text-sm space-y-1 text-ink/70">
          <li>App verzió: {verzio || '...'}</li>
          <li>
            <button onClick={() => window.api.appAdattarMegnyit()} className="text-sage-700 hover:underline">
              Adattár megnyitása (Intéző)
            </button>
          </li>
          <li>
            <button
              onClick={async () => {
                try {
                  const path = await window.api.backupKeszit();
                  alert(path ? `Backup elkészült:\n${path}` : 'Backup már létezett (ma).');
                } catch (err) {
                  console.error('[Beallitasok] biztonsági mentés sikertelen:', err);
                  alert('A biztonsági mentés nem sikerült. Nézd meg, van-e szabad hely a lemezen.');
                }
              }}
              className="text-sage-700 hover:underline"
            >
              Manuális backup most
            </button>
          </li>
        </ul>
      </div>

      <TitkositasKartya />
    </div>
  );
}

/**
 * Titkosítás állapota + a visszaállítási kulcs bármikori előhívása.
 *
 * Ez nem kényelmi funkció: a kulcs a Windows-fiókhoz kötődik, így fiókvesztés
 * (újratelepítés, profilsérülés) esetén CSAK a leírt kulccsal nyerhető vissza a
 * napló. Ha a papír elveszett, itt újra kikérhető.
 */
function TitkositasKartya() {
  const [allapot, setAllapot] = useState<{ aktiv: boolean; hiba: string | null } | null>(null);
  const [kulcs, setKulcs] = useState<string | null>(null);
  const [mentesUtvonal, setMentesUtvonal] = useState<string | null>(null);

  useEffect(() => {
    void window.api.titkositasAllapot().then(setAllapot);
  }, []);

  if (!allapot) return null;

  async function mutat() {
    const v = await window.api.titkositasKulcsMutat();
    if (v.siker) {
      setKulcs(v.kulcs);
      setMentesUtvonal(v.utvonal);
    } else {
      window.alert(v.hiba);
    }
  }

  return (
    <div className="card mt-6">
      <div className="field-label mb-2">Adatbiztonság</div>

      {allapot.aktiv ? (
        <>
          <p className="text-sm text-ink/70 mb-1">
            🔒 Az adatbázisod <strong>titkosítva</strong> van. A fájl önmagában — másik
            gépre másolva — nem olvasható.
          </p>
          <p className="text-sm text-ink/70 mb-3">
            A program magától kinyitja, jelszót nem kell gépelned. Ha viszont a Windowst
            újratelepítik vagy a felhasználói fiókod megsérül, <strong>csak a
            visszaállítási kulccsal</strong> nyerhetők vissza a tervezeteid.
          </p>

          <button onClick={mutat} className="btn-secondary">
            Visszaállítási kulcs megjelenítése és mentése
          </button>

          {kulcs && (
            <div className="mt-3 p-3 rounded border border-sage-200 bg-sage-50/50">
              <div className="field-label mb-1">A visszaállítási kulcsod</div>
              <code className="block text-sm break-all select-all font-mono">{kulcs}</code>
              <p className="text-xs text-ink/60 mt-2">
                Nyomtasd ki, vagy másold pendrive-ra — a gépen hagyott másolat a géppel
                együtt veszne el. Aki ismeri a kulcsot, el tudja olvasni a napló tartalmát.
              </p>
              {mentesUtvonal && (
                <p className="text-xs text-ink/60 mt-1">Mentve ide: {mentesUtvonal}</p>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-ink/70">
          ⚠️ Az adatbázis <strong>nincs titkosítva</strong>.
          {allapot.hiba ? ` (${allapot.hiba})` : ''}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="field-label block mb-1">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-sage-200 rounded px-3 py-2 text-base focus:border-sage-500 outline-none"
      />
    </label>
  );
}

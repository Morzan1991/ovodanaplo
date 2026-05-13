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
    await window.api.beallitasokSave(mentendo);
    setMentve(true);
    setTimeout(() => setMentve(false), 1500);
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
            <option value="kicsi">Kicsi csoport (3–4 éves)</option>
            <option value="kozepso">Középső csoport (4–5 éves)</option>
            <option value="nagy">Nagy csoport (5–7 éves)</option>
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
                const path = await window.api.backupKeszit();
                alert(path ? `Backup elkészült:\n${path}` : 'Backup már létezett (ma).');
              }}
              className="text-sage-700 hover:underline"
            >
              Manuális backup most
            </button>
          </li>
        </ul>
      </div>
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

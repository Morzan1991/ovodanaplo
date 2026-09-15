/**
 * Súgó — mi mire való a programban.
 *
 * A program több részből áll (naptár, heti terv, projektek, reflexiók,
 * irodalom, keresés), és korábban sehol nem volt leírva, melyik mit csinál,
 * és hogyan épülnek egymásra. Ez az oldal ezt pótolja — hétköznapi nyelven,
 * óvodapedagógus szemszögéből.
 */

import { Link } from 'react-router-dom';

function Szakasz({
  cim,
  ikon,
  children,
}: {
  cim: string;
  ikon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card mb-4">
      <h2 className="heading-serif text-xl font-medium mb-2">
        <span className="mr-2" aria-hidden="true">
          {ikon}
        </span>
        {cim}
      </h2>
      <div className="text-sm text-ink/75 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function Sugo() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <h1 className="heading-serif text-3xl font-medium">Súgó</h1>
      <p className="text-sm text-ink/60 mt-1 mb-6 max-w-2xl leading-relaxed">
        Rövid útmutató ahhoz, mi mire való a programban. Nem kell végigolvasni —
        elég ahhoz visszatérni, ami épp kérdés.
      </p>

      <Szakasz cim="Mire való ez a program?" ikon="🌿">
        <p>
          A heti tervek, foglalkozás-tervezetek és projektek megírását könnyíti meg. A
          kész terv <strong>Word-fájlba menthető</strong>, így feltölthető az
          oviKRÉTA csoportnaplójába, vagy kinyomtatható.
        </p>
        <p>
          A tervezéshez <strong>105 előre elkészített témát</strong> (sablont), több mint{' '}
          <strong>2977 tevékenység-ötletet</strong> és egy <strong>377 művet</strong>{' '}
          tartalmazó irodalmi gyűjteményt kínál — mindent a csoportod korosztályához
          igazítva.
        </p>
      </Szakasz>

      <Szakasz cim="Hogyan kezdj neki?" ikon="🧭">
        <ol className="list-decimal ml-5 space-y-1">
          <li>
            <strong>Beállítások</strong> — írd be az óvoda és a csoport nevét, és
            állítsd be a csoport korosztályát. Ez utóbbi mindent befolyásol: az
            ötleteket, az irodalmat és azt is, hogy az iskola-előkészítő rész
            megjelenik-e.
          </li>
          <li>
            <strong>Naptár</strong> — hozz létre nevelési évet. Ekkor a program
            felkínálja, hogy az egész évre elkészítse a heti terveket az ünnepekhez
            igazítva.
          </li>
          <li>
            <strong>Heti terv</strong> — nyisd meg a hetet, és szerkeszd kedvedre. Amit
            írsz, magától mentődik.
          </li>
        </ol>
      </Szakasz>

      <Szakasz cim="Naptár" ikon="📅">
        <p>
          A nevelési év áttekintése hónapokra bontva. Itt látod, melyik héten van
          ünnep, és innen nyithatod meg vagy hozhatod létre az egyes heti terveket.
        </p>
        <p>
          A <strong>„+ esemény"</strong> gombbal felveheted a ti saját alkalmaitokat is
          — nyílt nap, fotózás, színházlátogatás. A <strong>kellék-lista</strong> pedig
          összegyűjti, mire lesz szükséged a következő hetekben.
        </p>
      </Szakasz>

      <Szakasz cim="Heti terv" ikon="📝">
        <p>
          Az ONAP hét tevékenységi területe egy oldalon. Minden területnél a{' '}
          <strong>💡 Ötletek</strong> gombbal kaphatsz javaslatokat a témához és a
          korosztályhoz — ezekből egy kattintással emelhetsz át.
        </p>
        <p>
          A <strong>Dokumentum nézet</strong> úgy mutatja a tervet, ahogy a Word-fájlban
          ki fog nézni. A <strong>Sablon</strong> egy előre megírt téma (pl. Mikulás,
          Húsvét), amit kiindulásnak használhatsz, és utána szabadon átírhatsz.
        </p>
      </Szakasz>

      <Szakasz cim="Projektek és reflexiók" ikon="📚">
        <p>
          A <strong>projekt</strong> több hétre átívelő, összefüggő téma — a heti tervnél
          nagyobb egység. A <strong>reflexió</strong> pedig rövid feljegyzés arról,
          hogyan sikerült egy hét vagy foglalkozás; jövőre ebből tudsz építkezni, és
          ellenőrzésnél is jól jön.
        </p>
      </Szakasz>

      <Szakasz cim="Irodalom és keresés" ikon="🔍">
        <p>
          Az <strong>Irodalom</strong> mesék, versek, mondókák és dalok gyűjteménye,
          típus és korosztály szerint szűrhetően. A népi gyűjtések szövegét be is
          írhatod — onnantól a programban marad.
        </p>
        <p>
          A <strong>Keresés</strong> a korábbi heti terveid teljes szövegében keres,
          évekre visszamenőleg. Ha egy témát már kidolgoztál, nem kell újra kitalálni.
        </p>
      </Szakasz>

      <Szakasz cim="Ami magától történik" ikon="🔒">
        <ul className="list-disc ml-5 space-y-1">
          <li>
            <strong>Automatikus mentés:</strong> amit a heti tervbe írsz, pár másodperc
            múlva magától mentődik. A Mentés gomb mellett látod az állapotát.
          </li>
          <li>
            <strong>Napi biztonsági mentés:</strong> a program naponta készít másolatot
            az adataidról, és 30 napig megőrzi őket.
          </li>
          <li>
            <strong>Titkosítás:</strong> az adatbázis titkosítva van, más gépen nem
            olvasható. A <em>visszaállítási kulcsot</em> a Beállításokban éred el —
            érdemes kinyomtatni és a gépen kívül tartani.
          </li>
          <li>
            <strong>Korosztály:</strong> kis- és középső csoportban az iskola-előkészítő
            rész sem a képernyőn, sem a Word-fájlban nem jelenik meg.
          </li>
        </ul>
      </Szakasz>

      <p className="text-sm text-ink/60">
        Kezdéshez ugorj a <Link to="/beallitasok" className="text-sage-700 underline">Beállításokhoz</Link>{' '}
        vagy a <Link to="/naptar" className="text-sage-700 underline">Naptárhoz</Link>.
      </p>
    </div>
  );
}

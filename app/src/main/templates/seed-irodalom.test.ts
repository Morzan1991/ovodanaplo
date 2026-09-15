/**
 * Őrzőteszt az irodalomtár és a sablonszövegek alaki épségére.
 *
 * MIÉRT: a művek nagy része egy nyomtatott kiadvány PDF-jéből lett kinyerve.
 * A kinyerés néhol lapfejlécet tett műnek („MESÉLÉS"), néhol a cím elejét
 * levágta („fújása"), néhol a szerzőt a cím mezőbe ragasztotta („Vers: Gyárfás
 * Endre: Írogató"), egyszer pedig a nagy I-t három kis L-nek olvasta
 * („lllyés Gyula"). Ezeket kézzel javítottuk a korpuszban, és a
 * `tools/irodalom_takaritas.py` vezette ki őket az irodalomtárból.
 *
 * Az irodalomtár viszont CSAK BŐVÜL (lásd `irodalom_beepites.py`), ezért egy
 * visszacsúszó hiba örökre bent maradna. Ez a teszt azt figyeli, hogy ilyen
 * alakú tétel ne kerülhessen vissza észrevétlenül.
 */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const SEED = join(__dirname, '..', '..', '..', '..', 'seed')

type Tetel = { tipus: string; cim: string; szerzo?: string }

const irodalom: Tetel[] = JSON.parse(
  readFileSync(join(SEED, 'literature.json'), 'utf-8')
).tetelek

/** Kiejtés szerint mássalhangzóval kezdődő, de betű szerint magánhangzós szavak. */
const NEVELO_KIVETEL = /^(egy|egye|egyes|együtt|egyre|egyéb|egyik|egymás|egész|egészen|egészség|egészséges|egyensúly|egyenletes|egyenes|uniós|unió|európai|óvoda|óvodás|óvodai|óvó|ujj)/i

describe('irodalomtár alaki épsége', () => {
  it('nincs csupa nagybetűs cím (lapfejléc a kiadványból)', () => {
    const rossz = irodalom.filter((t) => {
      const betuk = [...t.cim].filter((c) => /\p{L}/u.test(c))
      return betuk.length > 2 && betuk.every((c) => c === c.toUpperCase())
    })
    expect(rossz.map((t) => t.cim)).toEqual([])
  })

  it('nincs kisbetűvel kezdődő cím (levágott címeleje)', () => {
    const rossz = irodalom.filter((t) => {
      const elso = t.cim.trim()[0]
      return elso && elso === elso.toLowerCase() && elso !== elso.toUpperCase()
    })
    expect(rossz.map((t) => t.cim)).toEqual([])
  })

  it('nincs zárójellel kezdődő cím (levágott címeleje)', () => {
    const rossz = irodalom.filter((t) => t.cim.trim().startsWith('('))
    expect(rossz.map((t) => t.cim)).toEqual([])
  })

  it('a műfaj nem ragad bele a címbe', () => {
    const rossz = irodalom.filter((t) => /^(Vers|Mese|Népmese|Mondóka|Dal):\s/i.test(t.cim))
    expect(rossz.map((t) => t.cim)).toEqual([])
  })

  it('a szerző nem ragad bele a címbe, ha külön mezője is van', () => {
    // „Vezetéknév Keresztnév: Cím" alak, miközben a szerző mező üres.
    const rossz = irodalom.filter(
      (t) => !t.szerzo && /^[A-ZÁÉÍÓÖŐÚÜŰ][\wáéíóöőúüű.]+ [A-ZÁÉÍÓÖŐÚÜŰ][\wáéíóöőúüű]+: /.test(t.cim)
    )
    expect(rossz.map((t) => t.cim)).toEqual([])
  })

  it('nincs „lll" kezdetű szó (OCR: nagy I három kis L-nek olvasva)', () => {
    const rossz = irodalom.filter((t) => /\blll/.test(t.cim) || /\blll/.test(t.szerzo ?? ''))
    expect(rossz.map((t) => t.cim)).toEqual([])
  })

  it('nincs értelmetlenül rövid cím', () => {
    const rossz = irodalom.filter((t) => t.cim.trim().length < 3)
    expect(rossz.map((t) => t.cim)).toEqual([])
  })
})

describe('magyar nyelvhelyesség a sablonok címében', () => {
  const sablonok: { azonosito: string; cim: string }[] = JSON.parse(
    readFileSync(join(SEED, 'weekly-templates.json'), 'utf-8')
  ).sablonok

  it('a határozott névelő „az" magánhangzó előtt', () => {
    const rossz: string[] = []
    for (const s of sablonok) {
      for (const m of s.cim.matchAll(/(?:^|\s)a\s+([aáeéiíoóöőuúüű]\p{L}+)/giu)) {
        if (!NEVELO_KIVETEL.test(m[1])) rossz.push(`${s.azonosito}: ${s.cim}`)
      }
    }
    expect(rossz).toEqual([])
  })
})

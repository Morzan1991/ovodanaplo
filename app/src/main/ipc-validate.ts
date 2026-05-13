/**
 * IPC input-validáció helper.
 *
 * A `main/ipc.ts` handler-jei használják, hogy a renderer-ből érkező adatokat
 * runtime-szinten ellenőrizzék (TypeScript csak compile-time biztonságot ad,
 * de a tényleges IPC-csomag bármilyen érték lehet).
 *
 * Használat:
 *   ipcMain.handle(IpcChannels.beallitasokSave, (_e, raw: unknown) => {
 *     const data = validate('beallitasokSave', raw, ujBeallitasSchema);
 *     return db.insert(...).values(data).returning().get();
 *   });
 *
 * Hibakezelés:
 * - Sikertelen validáció esetén `IpcValidationError`-t dob
 * - A renderer-ben a Promise reject ezt elkapja, és a hibaüzenetet a felhasználónak megmutatja
 */

import { z, ZodError } from 'zod';

export class IpcValidationError extends Error {
  constructor(
    public channel: string,
    public zodError: ZodError,
  ) {
    const reszletek = zodError.issues
      .map((e) => `${e.path.join('.') || '<root>'}: ${e.message}`)
      .join('; ');
    super(`[IPC ${channel}] érvénytelen bemenet: ${reszletek}`);
    this.name = 'IpcValidationError';
  }
}

/**
 * Validálja az IPC bemenetét egy Zod-schema-val.
 *
 * @param channel - Az IPC csatorna neve (hibanaplózáshoz).
 * @param data - A renderer-ből érkezett nyers adat (`unknown`).
 * @param schema - A Zod-schema, amivel parse-olunk.
 * @returns A tipusos, validált adat.
 * @throws `IpcValidationError` ha a validáció elbukik.
 */
export function validate<T>(channel: string, data: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[IPC ${channel}] validation FAILED:`, result.error.issues);
    throw new IpcValidationError(channel, result.error);
  }
  return result.data;
}

/**
 * Számoknál szigorúbb ellenőrzés (pl. `id` paraméterhez): pozitív egész.
 *
 * Használat:
 *   const id = validateId('hetiTervBetolt', raw);
 */
export function validateId(channel: string, data: unknown): number {
  if (typeof data !== 'number' || !Number.isInteger(data) || data <= 0) {
    throw new IpcValidationError(
      channel,
      new ZodError([
        {
          code: 'custom' as never,
          path: [],
          message: 'Érvénytelen ID — pozitív egész szám elvárt',
          input: data,
        },
      ]),
    );
  }
  return data;
}

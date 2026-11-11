// Fechas y horas en hora local del complejo (ver docs/producto/reglas-negocio.md).

/** Nombre de cada día según `dia_semana`: 0 = domingo … 6 = sábado. */
export const NOMBRES_DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** Días en el orden en que se muestran: de lunes a domingo. */
export const DIAS_LUNES_A_DOMINGO = [1, 2, 3, 4, 5, 6, 0];

/** "18:00:00" → 18. La medianoche de cierre llega como "24:00:00" → 24. */
export function horaDeTexto(texto: string): number {
  return Number(texto.slice(0, 2));
}

/** 18 → "18:00". 24 se muestra como "00:00" (cierre a medianoche). */
export function textoDeHora(hora: number): string {
  return `${String(hora % 24).padStart(2, '0')}:00`;
}

/** 18 → "18:00:00", el formato `time` de la base. 24 queda "24:00:00". */
export function horaParaBase(hora: number): string {
  return `${String(hora).padStart(2, '0')}:00:00`;
}

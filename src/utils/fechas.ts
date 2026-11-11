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

/** Argentina está en UTC-3 todo el año (sin horario de verano). */
const DESFASE_ARGENTINA_MS = -3 * 60 * 60 * 1000;

/** Fecha ("AAAA-MM-DD") y minutos desde la medianoche, en hora del complejo. */
export type Ahora = { fecha: string; minutos: number };

export function ahoraEnElComplejo(): Ahora {
  const local = new Date(Date.now() + DESFASE_ARGENTINA_MS);
  return {
    fecha: local.toISOString().slice(0, 10),
    minutos: local.getUTCHours() * 60 + local.getUTCMinutes(),
  };
}

function fechaComoUtc(fecha: string): Date {
  return new Date(`${fecha}T00:00:00Z`);
}

/** "2026-11-10" + 1 → "2026-11-11". */
export function sumarDias(fecha: string, dias: number): string {
  const resultado = fechaComoUtc(fecha);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado.toISOString().slice(0, 10);
}

/** 0 = domingo … 6 = sábado, igual que `dia_semana`. */
export function diaDeLaSemana(fecha: string): number {
  return fechaComoUtc(fecha).getUTCDay();
}

/** "2026-11-10" → "Martes 10/11". */
export function textoDeFecha(fecha: string): string {
  const [, mes, dia] = fecha.split('-');
  return `${NOMBRES_DIAS[diaDeLaSemana(fecha)]} ${dia}/${mes}`;
}

/** True si el turno ya empezó: la base rechaza reservarlo. */
export function turnoYaEmpezo(fecha: string, hora: number, ahora: Ahora): boolean {
  return fecha < ahora.fecha || (fecha === ahora.fecha && hora * 60 <= ahora.minutos);
}

/** Horas de inicio de los turnos de un horario: el último termina al cierre. */
export function horasDeTurnos(apertura: string, cierre: string): number[] {
  const horas: number[] = [];
  for (let hora = horaDeTexto(apertura); hora < horaDeTexto(cierre); hora++) {
    horas.push(hora);
  }
  return horas;
}

/** Minutos que faltan para que empiece el turno (negativo si ya empezó). */
export function minutosHastaTurno(fecha: string, hora: number, ahora: Ahora): number {
  const dias = Math.round((fechaComoUtc(fecha).getTime() - fechaComoUtc(ahora.fecha).getTime()) / 86_400_000);
  return dias * 24 * 60 + hora * 60 - ahora.minutos;
}

/** Momento exacto en que empieza el turno, como Date (el complejo está en UTC-3). */
export function inicioDelTurno(fecha: string, hora: number): Date {
  return new Date(fechaComoUtc(fecha).getTime() + hora * 3_600_000 - DESFASE_ARGENTINA_MS);
}

import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { CajaError } from '@/components/CajaError';
import { CampoInterruptor } from '@/components/CampoInterruptor';
import { PantallaError } from '@/components/PantallaError';
import { SelectorHora } from '@/components/SelectorHora';
import { useHorarios } from '@/hooks/useHorarios';
import type { DatosHorario } from '@/services/horarios';
import { colores, espaciados, radioBorde } from '@/theme';
import type { HorarioAtencion } from '@/types/tablas';
import { DIAS_LUNES_A_DOMINGO, horaDeTexto, horaParaBase, NOMBRES_DIAS } from '@/utils/fechas';
import { validarHorario } from '@/utils/validaciones';

type Dia = { abierto: boolean; apertura: number; cierre: number };

/** Horario que se propone al abrir un día que estaba cerrado. */
const APERTURA_INICIAL = 9;
const CIERRE_INICIAL = 23;

function semanaDesde(horarios: HorarioAtencion[]): Record<number, Dia> {
  const semana: Record<number, Dia> = {};
  for (const dia of DIAS_LUNES_A_DOMINGO) {
    const horario = horarios.find((h) => h.dia_semana === dia);
    semana[dia] = horario
      ? {
          abierto: true,
          apertura: horaDeTexto(horario.hora_apertura),
          cierre: horaDeTexto(horario.hora_cierre),
        }
      : { abierto: false, apertura: APERTURA_INICIAL, cierre: CIERRE_INICIAL };
  }
  return semana;
}

type PropsFormulario = {
  inicial: HorarioAtencion[];
  enviando: boolean;
  errorEnvio: string | null;
  guardar: (abiertos: DatosHorario[], diasCerrados: number[]) => Promise<boolean>;
};

function FormularioHorarios({ inicial, enviando, errorEnvio, guardar }: PropsFormulario) {
  const [semana, setSemana] = useState(() => semanaDesde(inicial));
  const [errores, setErrores] = useState<Record<number, string | null>>({});
  const [guardado, setGuardado] = useState(false);

  function cambiarDia(dia: number, cambios: Partial<Dia>) {
    setSemana((anterior) => ({ ...anterior, [dia]: { ...anterior[dia], ...cambios } }));
    setErrores((anteriores) => ({ ...anteriores, [dia]: null }));
    setGuardado(false);
  }

  async function enviar() {
    const nuevosErrores: Record<number, string | null> = {};
    for (const dia of DIAS_LUNES_A_DOMINGO) {
      const { abierto, apertura, cierre } = semana[dia];
      nuevosErrores[dia] = abierto ? validarHorario(apertura, cierre) : null;
    }
    setErrores(nuevosErrores);
    if (DIAS_LUNES_A_DOMINGO.some((dia) => nuevosErrores[dia])) {
      return;
    }

    const abiertos = DIAS_LUNES_A_DOMINGO.filter((dia) => semana[dia].abierto).map((dia) => ({
      dia_semana: dia,
      hora_apertura: horaParaBase(semana[dia].apertura),
      hora_cierre: horaParaBase(semana[dia].cierre),
    }));
    const cerrados = DIAS_LUNES_A_DOMINGO.filter((dia) => !semana[dia].abierto);
    setGuardado(await guardar(abiertos, cerrados));
  }

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <Text style={styles.ayuda}>
        Los turnos duran 1 hora: el último empieza una hora antes del cierre.
      </Text>
      {errorEnvio ? <CajaError mensaje={errorEnvio} /> : null}
      {DIAS_LUNES_A_DOMINGO.map((dia) => {
        const { abierto, apertura, cierre } = semana[dia];
        return (
          <View key={dia} style={styles.tarjeta}>
            <CampoInterruptor
              etiqueta={NOMBRES_DIAS[dia]}
              ayuda={abierto ? 'Abierto' : 'Cerrado'}
              valor={abierto}
              alCambiar={(valor) => cambiarDia(dia, { abierto: valor })}
            />
            {abierto ? (
              <>
                <View style={styles.horas}>
                  <SelectorHora
                    etiqueta="Apertura"
                    valor={apertura}
                    minimo={0}
                    maximo={23}
                    alCambiar={(valor) => cambiarDia(dia, { apertura: valor })}
                  />
                  <SelectorHora
                    etiqueta="Cierre"
                    valor={cierre}
                    minimo={1}
                    maximo={24}
                    alCambiar={(valor) => cambiarDia(dia, { cierre: valor })}
                  />
                </View>
                {errores[dia] ? <Text style={styles.error}>{errores[dia]}</Text> : null}
              </>
            ) : null}
          </View>
        );
      })}
      <Boton texto="Guardá los horarios" alPresionar={() => void enviar()} cargando={enviando} />
      {guardado ? <Text style={styles.exito}>Se guardaron los horarios.</Text> : null}
    </ScrollView>
  );
}

export default function Horarios() {
  const { datos, cargando, error, recargar, enviando, errorEnvio, guardar } = useHorarios();

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator color={colores.primario} size="large" />
      </View>
    );
  }
  if (error || !datos) {
    return (
      <PantallaError
        mensaje={error ?? 'No se pudieron cargar los horarios.'}
        alReintentar={() => void recargar()}
      />
    );
  }
  return (
    <FormularioHorarios
      inicial={datos}
      enviando={enviando}
      errorEnvio={errorEnvio}
      guardar={guardar}
    />
  );
}

const styles = StyleSheet.create({
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondo,
  },
  contenido: {
    gap: espaciados.m,
    padding: espaciados.m,
  },
  ayuda: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  tarjeta: {
    gap: espaciados.s,
    padding: espaciados.m,
    backgroundColor: colores.superficie,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radioBorde,
  },
  horas: {
    flexDirection: 'row',
    gap: espaciados.m,
  },
  error: {
    fontSize: 14,
    color: colores.error,
  },
  exito: {
    fontSize: 14,
    textAlign: 'center',
    color: colores.primario,
  },
});

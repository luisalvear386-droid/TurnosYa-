import { router } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Boton } from '@/components/Boton';
import { CajaError } from '@/components/CajaError';
import { PantallaError } from '@/components/PantallaError';
import { Tarjeta } from '@/components/Tarjeta';
import { useCanchas } from '@/hooks/useCanchas';
import { colores, espaciados, radioBorde } from '@/theme';
import type { Cancha } from '@/types/tablas';

/** Abre el formulario: "nuevo" es un alta; un id, la edición. */
function abrirFormulario(id: string) {
  router.push({ pathname: '/canchas/[id]', params: { id } });
}

function FilaCancha({ cancha }: { cancha: Cancha }) {
  return (
    <Tarjeta
      alPresionar={() => abrirFormulario(cancha.id)}
      descripcion={`Editá ${cancha.nombre}${cancha.activa ? '' : ', inactiva'}`}>
      <View style={styles.filaTitulo}>
        <Text style={styles.nombre}>{cancha.nombre}</Text>
        {cancha.activa ? null : <Text style={styles.etiquetaInactiva}>Inactiva</Text>}
      </View>
      {cancha.descripcion ? <Text style={styles.descripcion}>{cancha.descripcion}</Text> : null}
    </Tarjeta>
  );
}

export default function Canchas() {
  const { datos, cargando, error, recargar } = useCanchas();

  if (!datos) {
    if (error) {
      return <PantallaError mensaje={error} alReintentar={() => void recargar()} />;
    }
    return (
      <View style={styles.centrado}>
        <ActivityIndicator color={colores.primario} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={datos}
      keyExtractor={(cancha) => cancha.id}
      renderItem={({ item }) => <FilaCancha cancha={item} />}
      contentContainerStyle={styles.lista}
      refreshControl={
        <RefreshControl
          refreshing={cargando}
          onRefresh={() => void recargar()}
          colors={[colores.primario]}
        />
      }
      ListHeaderComponent={
        <View style={styles.encabezado}>
          {error ? <CajaError mensaje={error} /> : null}
          <Boton texto="Agregá una cancha" alPresionar={() => abrirFormulario('nuevo')} />
        </View>
      }
      ListEmptyComponent={<Text style={styles.vacio}>Todavía no hay canchas. Agregá la primera.</Text>}
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
  lista: {
    gap: espaciados.s,
    padding: espaciados.m,
  },
  encabezado: {
    gap: espaciados.m,
    marginBottom: espaciados.s,
  },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciados.s,
  },
  nombre: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.texto,
  },
  etiquetaInactiva: {
    paddingHorizontal: espaciados.s,
    fontSize: 14,
    color: colores.texto,
    backgroundColor: colores.acento,
    borderRadius: radioBorde,
    overflow: 'hidden',
  },
  descripcion: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  vacio: {
    padding: espaciados.l,
    fontSize: 16,
    textAlign: 'center',
    color: colores.textoSuave,
  },
});

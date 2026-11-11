import { Tabs } from 'expo-router';

import { iconoTab, TabsPrincipales } from '@/components/TabsPrincipales';
import { useSincronizarRecordatorios } from '@/hooks/useSincronizarRecordatorios';

export default function JugadorLayout() {
  useSincronizarRecordatorios();

  return (
    <TabsPrincipales>
      <Tabs.Screen
        name="reservar"
        options={{ title: 'Reservar', tabBarIcon: iconoTab('calendar_month') }}
      />
      <Tabs.Screen
        name="mis-reservas"
        options={{ title: 'Mis reservas', tabBarIcon: iconoTab('event_note') }}
      />
    </TabsPrincipales>
  );
}

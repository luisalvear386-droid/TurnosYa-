import { Tabs } from 'expo-router';

import { iconoTab, TabsPrincipales } from '@/components/TabsPrincipales';

export default function JugadorLayout() {
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

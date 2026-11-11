import { Tabs } from 'expo-router';

import { iconoTab, TabsPrincipales } from '@/components/TabsPrincipales';

export default function AdminLayout() {
  return (
    <TabsPrincipales>
      <Tabs.Screen name="agenda" options={{ title: 'Agenda', tabBarIcon: iconoTab('today') }} />
      <Tabs.Screen
        name="canchas/index"
        options={{ title: 'Canchas', tabBarIcon: iconoTab('sports_soccer') }}
      />
      <Tabs.Screen name="horarios" options={{ title: 'Horarios', tabBarIcon: iconoTab('schedule') }} />
    </TabsPrincipales>
  );
}

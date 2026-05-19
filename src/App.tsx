import { useState } from 'react';
import { TabNav } from './components/layout/TabNav';
import { BiseccionTab } from './tabs/BiseccionTab';
import { NewtonRaphsonTab } from './tabs/NewtonRaphsonTab';
import { PuntoFijoTab } from './tabs/PuntoFijoTab';
import { AitkenTab } from './tabs/AitkenTab';
import { LagrangeTab } from './tabs/LagrangeTab';
import { DifFinitasTab } from './tabs/DifFinitasTab';
import { NewtonCotesTab } from './tabs/NewtonCotesTab';
import { MontecarloTab } from './tabs/MontecarloTab';
import { EDOTab } from './tabs/EDOTab';
import { Sistemas1DTab } from './tabs/Sistemas1DTab';
import type { TabId } from './types/numerical';

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'biseccion', label: 'Biseccion' },
  { id: 'punto-fijo', label: 'Punto Fijo' },
  { id: 'aitken', label: 'Aitken' },
  { id: 'newton-raphson', label: 'Newton-Raphson' },
  { id: 'lagrange', label: 'Lagrange' },
  { id: 'dif-finitas', label: 'Dif. Finitas' },
  { id: 'newton-cotes', label: 'Newton-Cotes' },
  { id: 'montecarlo', label: 'Montecarlo' },
  { id: 'edo', label: 'EDO (Euler/Heun/RK4)' },
  { id: 'sistemas-1d', label: 'Sistemas Autónomos 1D' },
];

const renderTab = (tab: TabId) => {
  switch (tab) {
    case 'biseccion':
      return <BiseccionTab />;
    case 'newton-raphson':
      return <NewtonRaphsonTab />;
    case 'punto-fijo':
      return <PuntoFijoTab />;
    case 'aitken':
      return <AitkenTab />;
    case 'lagrange':
      return <LagrangeTab />;
    case 'dif-finitas':
      return <DifFinitasTab />;
    case 'newton-cotes':
      return <NewtonCotesTab />;
    case 'montecarlo':
      return <MontecarloTab />;
    case 'edo':
      return <EDOTab />;
    case 'sistemas-1d':
      return <Sistemas1DTab />;
    default:
      return null;
  }
};

const App = () => {
  const [activeTab, setActiveTab] = useState<TabId>('biseccion');

  return (
    <div className="min-h-screen">
      <TabNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      <main className="mx-auto max-w-7xl p-4 md:p-6">{renderTab(activeTab)}</main>
    </div>
  );
};

export default App;

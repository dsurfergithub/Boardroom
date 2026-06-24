import { useState, useMemo, useEffect } from 'react';
import { useBoardroom } from '../context';
import { Header } from './Header';
import { Board } from './Board';

export function MainLayout() {
  const { state } = useBoardroom();
  
  // For now, assume first board and first sprint if not set
  const [activeTableroId, setActiveTableroId] = useState(state.tableros[0]?.id || '');
  const sprintsTablero = useMemo(() => state.sprints.filter(s => s.tableroId === activeTableroId), [state.sprints, activeTableroId]);
  const defaultSprint = sprintsTablero.find(s => s.activo)?.id || sprintsTablero[0]?.id || '';
  const [activeSprintId, setActiveSprintId] = useState(defaultSprint);

  useEffect(() => {
    const newSprints = state.sprints.filter(s => s.tableroId === activeTableroId);
    const newDefaultSprint = newSprints.find(s => s.activo)?.id || newSprints[0]?.id || '';
    if (newDefaultSprint) {
      setActiveSprintId(newDefaultSprint);
    }
  }, [activeTableroId, state.sprints]);

  // View state: 'global' (all columns) | 'tabs' (one column)
  const [viewMode, setViewMode] = useState<'global' | 'tabs'>('global');

  if (!activeTableroId) return <div className="p-4 text-center">No hay tableros</div>;

  return (
    <div className="flex flex-col bg-black text-[#F2F2F7] font-sans selection:bg-[#0A84FF] overflow-hidden" style={{ height: '100dvh', paddingTop: 'env(safe-area-inset-top)' }}>
      <Header 
        activeTableroId={activeTableroId} 
        setActiveTableroId={setActiveTableroId}
        activeSprintId={activeSprintId}
        setActiveSprintId={setActiveSprintId}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      <main className="flex-1 overflow-hidden relative" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <Board tableroId={activeTableroId} sprintId={activeSprintId} viewMode={viewMode} />
      </main>
    </div>
  );
}

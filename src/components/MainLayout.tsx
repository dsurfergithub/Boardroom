import { useState, useMemo, useEffect } from 'react';
import { useBoardroom } from '../context';
import { Header } from './Header';
import { Board } from './Board';
import { SearchFilterBar } from './SearchFilterBar';
import { SprintDashboard } from './SprintDashboard';
import { AISprintPlannerModal } from './AISprintPlannerModal';
import { AIWeeklyReviewModal } from './AIWeeklyReviewModal';
import { PromptModal } from './PromptModal';
import { ConfirmModal } from './ConfirmModal';
import { FiltrosActivos, AppState } from '../types';

const BACKUP_KEY = 'boardroom_last_backup';
const AUTOBACKUP_KEY = 'boardroom_autobackup';

export function MainLayout() {
  const { state, updateState, importState, exportState } = useBoardroom();

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

  const [viewMode, setViewMode] = useState<'global' | 'tabs'>('global');
  const [compacto, setCompacto] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosActivos>({
    texto: '',
    prioridades: [],
    esfuerzos: [],
    soloVencidas: false,
  });

  const [showDashboard, setShowDashboard] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [shareImport, setShareImport] = useState<string | null>(null);

  // Handle ?share= on load, and weekly auto-backup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const share = params.get('share');
    if (share) {
      try {
        const json = decodeURIComponent(atob(share));
        setShareImport(json);
      } catch {
        // ignore malformed share data
      }
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (localStorage.getItem(AUTOBACKUP_KEY) === 'true') {
      const last = Number(localStorage.getItem(BACKUP_KEY)) || 0;
      const semana = 7 * 24 * 60 * 60 * 1000;
      if (!last || Date.now() - last > semana) {
        exportState();
        localStorage.setItem(BACKUP_KEY, Date.now().toString());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeTablero = state.tableros.find(t => t.id === activeTableroId);
  const accentColor = activeTablero?.color || '#0A84FF';
  const activeSprint = state.sprints.find(s => s.id === activeSprintId);
  const readOnly = !!activeSprint?.archivado;

  const executeAddColumna = (nombre: string) => {
    if (!nombre.trim() || !activeTableroId) return;
    updateState((prev: AppState) => {
      const cols = prev.columnas.filter(c => c.tableroId === activeTableroId);
      const maxOrden = cols.reduce((m, c) => Math.max(m, c.orden), -1);
      return {
        ...prev,
        columnas: [
          ...prev.columnas,
          { id: crypto.randomUUID(), tableroId: activeTableroId, nombre: nombre.trim(), orden: maxOrden + 1 },
        ],
      };
    });
    setShowAddColumn(false);
  };

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
        compacto={compacto}
        setCompacto={setCompacto}
        onOpenDashboard={() => setShowDashboard(true)}
        onOpenPlanner={() => setShowPlanner(true)}
        onOpenReview={() => setShowReview(true)}
      />
      <SearchFilterBar filtros={filtros} setFiltros={setFiltros} />
      <main className="flex-1 overflow-hidden relative" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <Board
          tableroId={activeTableroId}
          sprintId={activeSprintId}
          viewMode={viewMode}
          filtros={filtros}
          compacto={compacto}
          readOnly={readOnly}
          accentColor={accentColor}
          onAddColumn={() => setShowAddColumn(true)}
        />
      </main>

      {showDashboard && (
        <SprintDashboard
          tableroId={activeTableroId}
          sprintId={activeSprintId}
          accentColor={accentColor}
          onClose={() => setShowDashboard(false)}
        />
      )}

      {showPlanner && (
        <AISprintPlannerModal
          tableroId={activeTableroId}
          sprintId={activeSprintId}
          onClose={() => setShowPlanner(false)}
        />
      )}

      {showReview && (
        <AIWeeklyReviewModal
          tableroId={activeTableroId}
          sprintId={activeSprintId}
          onClose={() => setShowReview(false)}
        />
      )}

      {showAddColumn && (
        <PromptModal
          title="Nombre de la nueva columna:"
          placeholder="Escribe un nombre..."
          onConfirm={executeAddColumna}
          onCancel={() => setShowAddColumn(false)}
        />
      )}

      {shareImport && (
        <ConfirmModal
          title="Se ha detectado un tablero compartido. ¿Cargarlo? Se reemplazarán tus datos actuales."
          confirmText="Cargar"
          cancelText="Descartar"
          onConfirm={() => {
            importState(shareImport);
            setShareImport(null);
          }}
          onCancel={() => setShareImport(null)}
        />
      )}
    </div>
  );
}

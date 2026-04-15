import { useState, useMemo } from "react";
import { getLockers, getEmployees, assignLocker, releaseLocker, addLocker } from "@/data/store";
import { DoorOpen, Plus, Search, X } from "lucide-react";

export default function Lockers() {
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | "disponivel" | "ocupado">("todos");
  const [showAdd, setShowAdd] = useState(false);
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [newLocker, setNewLocker] = useState({ number: "", location: "" });

  const lockers = useMemo(() => getLockers(), [refresh]);
  const employees = useMemo(() => getEmployees().filter(e => e.status === "ativo"), [refresh]);

  const filtered = lockers.filter(l => {
    if (filter !== "todos" && l.status !== filter) return false;
    const emp = l.employeeId ? getEmployees().find(e => e.id === l.employeeId) : null;
    const text = `${l.number} ${l.location} ${emp?.name ?? ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const handleAdd = () => {
    if (!newLocker.number || !newLocker.location) return;
    addLocker({ ...newLocker, status: "disponivel" });
    setNewLocker({ number: "", location: "" });
    setShowAdd(false);
    setRefresh(r => r + 1);
  };

  const handleAssign = (lockerId: string, employeeId: string) => {
    assignLocker(lockerId, employeeId);
    setShowAssign(null);
    setRefresh(r => r + 1);
  };

  const handleRelease = (lockerId: string) => {
    releaseLocker(lockerId);
    setRefresh(r => r + 1);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar armário ou colaborador..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as any)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="todos">Todos</option>
          <option value="disponivel">Disponíveis</option>
          <option value="ocupado">Ocupados</option>
        </select>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Novo Armário
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map(l => {
          const emp = l.employeeId ? getEmployees().find(e => e.id === l.employeeId) : null;
          const isInconsistent = emp && emp.status === "desligado";
          return (
            <div key={l.id} className={`
              glass-card rounded-xl p-4 text-center space-y-2 relative
              ${isInconsistent ? "ring-2 ring-destructive" : ""}
            `}>
              <DoorOpen className={`h-8 w-8 mx-auto ${l.status === "disponivel" ? "text-success" : "text-primary"}`} />
              <p className="font-semibold text-sm">{l.number}</p>
              <p className="text-xs text-muted-foreground">{l.location}</p>
              <span className={`
                inline-block text-xs px-2 py-0.5 rounded-full font-medium
                ${l.status === "disponivel" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}
              `}>
                {l.status === "disponivel" ? "Disponível" : "Ocupado"}
              </span>
              {emp && <p className="text-xs text-muted-foreground truncate">{emp.name}</p>}
              {isInconsistent && <p className="text-xs text-destructive font-medium">⚠ Ex-colaborador</p>}

              <div className="pt-1">
                {l.status === "disponivel" ? (
                  <button
                    onClick={() => setShowAssign(l.id)}
                    className="text-xs px-3 py-1 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Atribuir
                  </button>
                ) : (
                  <button
                    onClick={() => handleRelease(l.id)}
                    className="text-xs px-3 py-1 rounded-md border border-border text-foreground hover:bg-muted transition-colors"
                  >
                    Liberar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Novo Armário">
          <div className="space-y-3">
            <input
              placeholder="Número (ex: D-001)"
              value={newLocker.number}
              onChange={e => setNewLocker(p => ({ ...p, number: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              placeholder="Localização (ex: Bloco D)"
              value={newLocker.location}
              onChange={e => setNewLocker(p => ({ ...p, location: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button onClick={handleAdd} className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
              Cadastrar
            </button>
          </div>
        </Modal>
      )}

      {/* Assign Modal */}
      {showAssign && (
        <Modal onClose={() => setShowAssign(null)} title="Atribuir Armário">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {employees.filter(e => !getLockers().some(l => l.employeeId === e.id)).map(e => (
              <button
                key={e.id}
                onClick={() => handleAssign(showAssign, e.id)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm transition-colors"
              >
                <span className="font-medium">{e.name}</span>
                <span className="text-muted-foreground ml-2">· {e.sector}</span>
              </button>
            ))}
            {employees.filter(e => !getLockers().some(l => l.employeeId === e.id)).length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">Todos os colaboradores ativos já possuem armário.</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30" onClick={onClose}>
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-5 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

import { useState, useMemo, Fragment } from "react";
import { getEmployees, addEmployee, terminateEmployee, getLockers, getEPIDeliveries, getEPIs } from "@/data/store";
import { Plus, Search, UserX, X, ChevronDown, ChevronUp } from "lucide-react";

export default function Employees() {
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"todos" | "ativo" | "desligado">("todos");
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", sector: "", role: "", admissionDate: "" });

  const employees = useMemo(() => getEmployees(), [refresh]);

  const filtered = employees.filter(e => {
    if (filter !== "todos" && e.status !== filter) return false;
    return `${e.name} ${e.sector} ${e.role}`.toLowerCase().includes(search.toLowerCase());
  });

  const handleAdd = () => {
    if (!form.name || !form.sector || !form.role) return;
    addEmployee({ ...form, status: "ativo", admissionDate: form.admissionDate || new Date().toISOString().split("T")[0] });
    setForm({ name: "", sector: "", role: "", admissionDate: "" });
    setShowAdd(false);
    setRefresh(r => r + 1);
  };

  const handleTerminate = (id: string) => {
    if (confirm("Deseja realmente desligar este colaborador? O armário será liberado e EPIs serão marcados como pendentes.")) {
      terminateEmployee(id);
      setRefresh(r => r + 1);
    }
  };

  const getEmployeeDetails = (id: string) => {
    const lockers = getLockers();
    const deliveries = getEPIDeliveries();
    const epis = getEPIs();
    const locker = lockers.find(l => l.employeeId === id);
    const empDeliveries = deliveries.filter(d => d.employeeId === id).map(d => ({
      ...d,
      epiName: epis.find(e => e.id === d.epiId)?.type ?? "—",
    }));
    return { locker, deliveries: empDeliveries };
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar colaborador..."
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
          <option value="ativo">Ativos</option>
          <option value="desligado">Desligados</option>
        </select>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Novo Colaborador
        </button>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Setor</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Cargo</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const expanded = expandedId === e.id;
                const details = expanded ? getEmployeeDetails(e.id) : null;
                return (
                  <Fragment key={e.id}>
                    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setExpandedId(expanded ? null : e.id)}>
                      <td className="px-4 py-3 font-medium">{e.name}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{e.sector}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{e.role}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                          e.status === "ativo" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                        }`}>
                          {e.status === "ativo" ? "Ativo" : "Desligado"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {e.status === "ativo" && (
                            <button
                              onClick={(ev) => { ev.stopPropagation(); handleTerminate(e.id); }}
                              className="text-xs px-2 py-1 rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                              title="Desligar colaborador"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </td>
                    </tr>
                    {expanded && details && (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 bg-muted/20">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="font-medium text-foreground mb-1">Armário</p>
                              {details.locker
                                ? <p className="text-muted-foreground">{details.locker.number} — {details.locker.location}</p>
                                : <p className="text-muted-foreground">Nenhum armário atribuído</p>
                              }
                              <p className="mt-2 text-muted-foreground">Admissão: {e.admissionDate}</p>
                              {e.terminationDate && <p className="text-muted-foreground">Desligamento: {e.terminationDate}</p>}
                            </div>
                            <div>
                              <p className="font-medium text-foreground mb-1">EPIs ({details.deliveries.length})</p>
                              {details.deliveries.length === 0
                                ? <p className="text-muted-foreground">Nenhum EPI registrado</p>
                                : details.deliveries.map(d => (
                                  <div key={d.id} className="flex items-center justify-between py-0.5">
                                    <span className="text-muted-foreground">{d.epiName}</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                      d.status === "em_uso" ? "bg-primary/15 text-primary"
                                      : d.status === "devolvido" ? "bg-success/15 text-success"
                                      : "bg-warning/15 text-warning"
                                    }`}>
                                      {d.status === "em_uso" ? "Em uso" : d.status === "devolvido" ? "Devolvido" : "Pendente"}
                                    </span>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-sm text-muted-foreground">Nenhum colaborador encontrado.</p>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-5 space-y-4" onClick={ev => ev.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Novo Colaborador</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-md hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Nome completo" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input placeholder="Setor" value={form.sector} onChange={e => setForm(p => ({ ...p, sector: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input placeholder="Cargo" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input type="date" value={form.admissionDate} onChange={e => setForm(p => ({ ...p, admissionDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={handleAdd} className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

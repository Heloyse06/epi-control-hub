import { useState, useMemo, Fragment } from "react";
import { getEPIs, getEPIDeliveries, getEmployees, addEPI, addEPIDelivery, returnEPI, updateEPI } from "@/data/store";
import { Plus, Search, X, Package, RotateCcw, Truck, Pencil } from "lucide-react";

export default function EPIs() {
  const [refresh, setRefresh] = useState(0);
  const [tab, setTab] = useState<"inventario" | "entregas">("inventario");
  const [search, setSearch] = useState("");
  const [showAddEPI, setShowAddEPI] = useState(false);
  const [showDeliver, setShowDeliver] = useState(false);
  const [epiForm, setEpiForm] = useState({ type: "", description: "", quantity: "", expiryDate: "" });
  const [deliverForm, setDeliverForm] = useState({ epiId: "", employeeId: "", quantity: "1" });

  const epis = useMemo(() => getEPIs(), [refresh]);
  const deliveries = useMemo(() => getEPIDeliveries(), [refresh]);
  const employees = useMemo(() => getEmployees(), [refresh]);
  const activeEmployees = employees.filter(e => e.status === "ativo");

  const filteredEPIs = epis.filter(e =>
    `${e.type} ${e.description}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDeliveries = deliveries.filter(d => {
    const emp = employees.find(e => e.id === d.employeeId);
    const epi = epis.find(e => e.id === d.epiId);
    return `${emp?.name ?? ""} ${epi?.type ?? ""}`.toLowerCase().includes(search.toLowerCase());
  });

  const handleAddEPI = () => {
    if (!epiForm.type || !epiForm.quantity) return;
    addEPI({ type: epiForm.type, description: epiForm.description, quantity: parseInt(epiForm.quantity), expiryDate: epiForm.expiryDate });
    setEpiForm({ type: "", description: "", quantity: "", expiryDate: "" });
    setShowAddEPI(false);
    setRefresh(r => r + 1);
  };

  const handleDeliver = () => {
    if (!deliverForm.epiId || !deliverForm.employeeId) return;
    addEPIDelivery({
      epiId: deliverForm.epiId,
      employeeId: deliverForm.employeeId,
      deliveryDate: new Date().toISOString().split("T")[0],
      status: "em_uso",
      quantity: parseInt(deliverForm.quantity) || 1,
    });
    setDeliverForm({ epiId: "", employeeId: "", quantity: "1" });
    setShowDeliver(false);
    setRefresh(r => r + 1);
  };

  const handleReturn = (id: string) => {
    returnEPI(id);
    setRefresh(r => r + 1);
  };

  const statusLabel = (s: string) =>
    s === "em_uso" ? "Em uso" : s === "devolvido" ? "Devolvido" : "Pendente";
  const statusClass = (s: string) =>
    s === "em_uso" ? "bg-primary/15 text-primary" : s === "devolvido" ? "bg-success/15 text-success" : "bg-warning/15 text-warning";

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
        <button onClick={() => setTab("inventario")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "inventario" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
          <Package className="h-4 w-4 inline mr-1.5 -mt-0.5" />Inventário
        </button>
        <button onClick={() => setTab("entregas")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "entregas" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
          <Truck className="h-4 w-4 inline mr-1.5 -mt-0.5" />Entregas
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder={tab === "inventario" ? "Buscar EPI..." : "Buscar por colaborador ou EPI..."}
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {tab === "inventario" ? (
          <button onClick={() => setShowAddEPI(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Plus className="h-4 w-4" /> Novo EPI
          </button>
        ) : (
          <button onClick={() => setShowDeliver(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
            <Truck className="h-4 w-4" /> Registrar Entrega
          </button>
        )}
      </div>

      {/* Inventory Tab */}
      {tab === "inventario" && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Descrição</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Qtd</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Validade</th>
                </tr>
              </thead>
              <tbody>
                {filteredEPIs.map(e => (
                  <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{e.type}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{e.description}</td>
                    <td className="px-4 py-3">{e.quantity}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{e.expiryDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredEPIs.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">Nenhum EPI encontrado.</p>}
        </div>
      )}

      {/* Deliveries Tab */}
      {tab === "entregas" && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Colaborador</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">EPI</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Entrega</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map(d => {
                  const emp = employees.find(e => e.id === d.employeeId);
                  const epi = epis.find(e => e.id === d.epiId);
                  return (
                    <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{emp?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{epi?.type ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{d.deliveryDate}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${statusClass(d.status)}`}>
                          {statusLabel(d.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(d.status === "em_uso" || d.status === "pendente_devolucao") && (
                          <button onClick={() => handleReturn(d.id)} className="text-xs px-2 py-1 rounded-md border border-border text-foreground hover:bg-muted transition-colors" title="Registrar devolução">
                            <RotateCcw className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredDeliveries.length === 0 && <p className="text-center py-8 text-sm text-muted-foreground">Nenhuma entrega encontrada.</p>}
        </div>
      )}

      {/* Add EPI Modal */}
      {showAddEPI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30" onClick={() => setShowAddEPI(false)}>
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Novo EPI</h3>
              <button onClick={() => setShowAddEPI(false)} className="p-1 rounded-md hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Tipo (ex: Capacete)" value={epiForm.type} onChange={e => setEpiForm(p => ({ ...p, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input placeholder="Descrição" value={epiForm.description} onChange={e => setEpiForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input type="number" placeholder="Quantidade" value={epiForm.quantity} onChange={e => setEpiForm(p => ({ ...p, quantity: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input type="date" placeholder="Validade" value={epiForm.expiryDate} onChange={e => setEpiForm(p => ({ ...p, expiryDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={handleAddEPI} className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deliver Modal */}
      {showDeliver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30" onClick={() => setShowDeliver(false)}>
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Registrar Entrega de EPI</h3>
              <button onClick={() => setShowDeliver(false)} className="p-1 rounded-md hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <select value={deliverForm.employeeId} onChange={e => setDeliverForm(p => ({ ...p, employeeId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Selecione o colaborador</option>
                {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
              <select value={deliverForm.epiId} onChange={e => setDeliverForm(p => ({ ...p, epiId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Selecione o EPI</option>
                {epis.map(e => <option key={e.id} value={e.id}>{e.type} — {e.description}</option>)}
              </select>
              <input type="number" placeholder="Quantidade" value={deliverForm.quantity} onChange={e => setDeliverForm(p => ({ ...p, quantity: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <button onClick={handleDeliver} className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                Registrar Entrega
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

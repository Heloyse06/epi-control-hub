import { useMemo, useState } from "react";
import { getEmployees, getLockers, getEPIs, getEPIDeliveries, getAlerts, releaseLocker, returnEPI } from "@/data/store";
import { AlertTriangle, DoorOpen, Users, HardHat, ShieldAlert, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const [refresh, setRefresh] = useState(0);
  const data = useMemo(() => {
    const employees = getEmployees();
    const lockers = getLockers();
    const epis = getEPIs();
    const deliveries = getEPIDeliveries();
    const alerts = getAlerts();

    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.status === "ativo").length,
      terminatedEmployees: employees.filter(e => e.status === "desligado").length,
      totalLockers: lockers.length,
      availableLockers: lockers.filter(l => l.status === "disponivel").length,
      occupiedLockers: lockers.filter(l => l.status === "ocupado").length,
      totalEPIs: epis.reduce((sum, e) => sum + e.quantity, 0),
      episInUse: deliveries.filter(d => d.status === "em_uso").length,
      episPending: deliveries.filter(d => d.status === "pendente_devolucao").length,
      alerts,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const resolveAlert = (alert: { type: string; message: string }) => {
    // Try to auto-resolve
    if (alert.message.startsWith("Armário")) {
      const num = alert.message.match(/Armário (\S+)/)?.[1];
      if (num) {
        const lockers = getLockers();
        const l = lockers.find(x => x.number === num);
        if (l) releaseLocker(l.id);
      }
    }
    if (alert.message.includes("EPI")) {
      const deliveries = getEPIDeliveries();
      const pending = deliveries.find(d => d.status === "pendente_devolucao" && alert.message.includes(d.id));
      if (pending) returnEPI(pending.id);
    }
    setRefresh(r => r + 1);
  };

  const stats = [
    { label: "Colaboradores Ativos", value: data.activeEmployees, icon: Users, color: "text-info" },
    { label: "Armários Disponíveis", value: `${data.availableLockers}/${data.totalLockers}`, icon: DoorOpen, color: "text-success" },
    { label: "EPIs em Uso", value: data.episInUse, icon: HardHat, color: "text-primary" },
    { label: "EPIs Pendentes", value: data.episPending, icon: ShieldAlert, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="glass-card rounded-xl p-5 flex items-start gap-4">
            <div className={`p-2.5 rounded-lg bg-muted ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Alertas e Inconsistências ({data.alerts.length})
        </h2>
        {data.alerts.length === 0 ? (
          <div className="flex items-center gap-2 text-success text-sm py-4">
            <CheckCircle className="h-5 w-5" />
            Nenhuma inconsistência encontrada.
          </div>
        ) : (
          <div className="space-y-2">
            {data.alerts.map((a, i) => (
              <div key={i} className={`
                flex items-center justify-between gap-3 p-3 rounded-lg text-sm
                ${a.type === "error" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}
              `}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {a.message}
                </div>
                <button
                  onClick={() => resolveAlert(a)}
                  className="text-xs px-3 py-1 rounded-md bg-background border border-border text-foreground hover:bg-muted transition-colors shrink-0"
                >
                  Resolver
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Ocupação de Armários</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(data.occupiedLockers / data.totalLockers) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round((data.occupiedLockers / data.totalLockers) * 100)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {data.occupiedLockers} ocupados · {data.availableLockers} disponíveis
          </p>
        </div>

        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Colaboradores</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${(data.activeEmployees / data.totalEmployees) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round((data.activeEmployees / data.totalEmployees) * 100)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {data.activeEmployees} ativos · {data.terminatedEmployees} desligados
          </p>
        </div>
      </div>
    </div>
  );
}

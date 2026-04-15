// Simple in-memory data store

export interface Employee {
  id: string;
  name: string;
  sector: string;
  role: string;
  status: "ativo" | "desligado";
  admissionDate: string;
  terminationDate?: string;
}

export interface Locker {
  id: string;
  number: string;
  location: string;
  status: "disponivel" | "ocupado";
  employeeId?: string;
}

export interface EPI {
  id: string;
  type: string;
  description: string;
  quantity: number;
  expiryDate: string;
}

export interface EPIDelivery {
  id: string;
  epiId: string;
  employeeId: string;
  deliveryDate: string;
  returnDate?: string;
  status: "em_uso" | "devolvido" | "pendente_devolucao";
  quantity: number;
}

// Initial mock data
let employees: Employee[] = [
  { id: "1", name: "Carlos Silva", sector: "Produção", role: "Operador", status: "ativo", admissionDate: "2023-01-15" },
  { id: "2", name: "Ana Souza", sector: "Manutenção", role: "Técnica", status: "ativo", admissionDate: "2022-06-10" },
  { id: "3", name: "João Santos", sector: "Logística", role: "Auxiliar", status: "desligado", admissionDate: "2021-03-20", terminationDate: "2025-12-01" },
  { id: "4", name: "Maria Oliveira", sector: "Produção", role: "Supervisora", status: "ativo", admissionDate: "2020-08-05" },
  { id: "5", name: "Pedro Costa", sector: "Qualidade", role: "Inspetor", status: "ativo", admissionDate: "2024-02-01" },
  { id: "6", name: "Lucia Ferreira", sector: "Manutenção", role: "Engenheira", status: "desligado", admissionDate: "2019-11-12", terminationDate: "2026-01-15" },
  { id: "7", name: "Roberto Almeida", sector: "Produção", role: "Operador", status: "ativo", admissionDate: "2023-09-01" },
  { id: "8", name: "Fernanda Lima", sector: "Logística", role: "Coordenadora", status: "ativo", admissionDate: "2022-04-18" },
];

let lockers: Locker[] = [
  { id: "1", number: "A-001", location: "Bloco A", status: "ocupado", employeeId: "1" },
  { id: "2", number: "A-002", location: "Bloco A", status: "ocupado", employeeId: "2" },
  { id: "3", number: "A-003", location: "Bloco A", status: "ocupado", employeeId: "3" }, // inconsistency: assigned to terminated employee
  { id: "4", number: "A-004", location: "Bloco A", status: "ocupado", employeeId: "4" },
  { id: "5", number: "B-001", location: "Bloco B", status: "disponivel" },
  { id: "6", number: "B-002", location: "Bloco B", status: "ocupado", employeeId: "5" },
  { id: "7", number: "B-003", location: "Bloco B", status: "disponivel" },
  { id: "8", number: "B-004", location: "Bloco B", status: "ocupado", employeeId: "7" },
  { id: "9", number: "C-001", location: "Bloco C", status: "disponivel" },
  { id: "10", number: "C-002", location: "Bloco C", status: "ocupado", employeeId: "8" },
  { id: "11", number: "C-003", location: "Bloco C", status: "disponivel" },
  { id: "12", number: "C-004", location: "Bloco C", status: "disponivel" },
];

let epis: EPI[] = [
  { id: "1", type: "Capacete", description: "Capacete de segurança classe B", quantity: 50, expiryDate: "2027-06-01" },
  { id: "2", type: "Luvas", description: "Luvas de proteção mecânica", quantity: 100, expiryDate: "2026-12-01" },
  { id: "3", type: "Óculos", description: "Óculos de proteção anti-respingo", quantity: 80, expiryDate: "2027-03-15" },
  { id: "4", type: "Protetor Auricular", description: "Protetor auricular tipo plug", quantity: 200, expiryDate: "2026-09-01" },
  { id: "5", type: "Botina", description: "Botina de segurança com biqueira de aço", quantity: 60, expiryDate: "2027-08-20" },
  { id: "6", type: "Máscara PFF2", description: "Respirador PFF2 sem válvula", quantity: 150, expiryDate: "2026-06-01" },
];

let epiDeliveries: EPIDelivery[] = [
  { id: "1", epiId: "1", employeeId: "1", deliveryDate: "2023-01-15", status: "em_uso", quantity: 1 },
  { id: "2", epiId: "2", employeeId: "1", deliveryDate: "2023-01-15", status: "em_uso", quantity: 1 },
  { id: "3", epiId: "5", employeeId: "1", deliveryDate: "2023-01-15", status: "em_uso", quantity: 1 },
  { id: "4", epiId: "1", employeeId: "2", deliveryDate: "2022-06-10", status: "em_uso", quantity: 1 },
  { id: "5", epiId: "3", employeeId: "2", deliveryDate: "2022-06-10", status: "em_uso", quantity: 1 },
  { id: "6", epiId: "1", employeeId: "3", deliveryDate: "2021-03-20", status: "pendente_devolucao", quantity: 1 }, // terminated, not returned
  { id: "7", epiId: "2", employeeId: "3", deliveryDate: "2021-03-20", status: "pendente_devolucao", quantity: 1 },
  { id: "8", epiId: "4", employeeId: "4", deliveryDate: "2020-08-05", status: "em_uso", quantity: 1 },
  { id: "9", epiId: "1", employeeId: "5", deliveryDate: "2024-02-01", status: "em_uso", quantity: 1 },
  { id: "10", epiId: "6", employeeId: "6", deliveryDate: "2019-11-12", status: "devolvido", returnDate: "2026-01-15", quantity: 1 },
  { id: "11", epiId: "2", employeeId: "7", deliveryDate: "2023-09-01", status: "em_uso", quantity: 1 },
  { id: "12", epiId: "5", employeeId: "8", deliveryDate: "2022-04-18", status: "em_uso", quantity: 1 },
];

let nextId = 100;
const genId = () => String(nextId++);

// Employees
export const getEmployees = () => [...employees];
export const getEmployee = (id: string) => employees.find(e => e.id === id);
export const addEmployee = (e: Omit<Employee, "id">) => {
  const emp = { ...e, id: genId() };
  employees.push(emp);
  return emp;
};
export const terminateEmployee = (id: string) => {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;
  emp.status = "desligado";
  emp.terminationDate = new Date().toISOString().split("T")[0];
  // Release locker
  const locker = lockers.find(l => l.employeeId === id);
  if (locker) {
    locker.status = "disponivel";
    locker.employeeId = undefined;
  }
  // Mark EPIs as pending return
  epiDeliveries.filter(d => d.employeeId === id && d.status === "em_uso").forEach(d => {
    d.status = "pendente_devolucao";
  });
  return emp;
};

// Lockers
export const getLockers = () => [...lockers];
export const assignLocker = (lockerId: string, employeeId: string) => {
  const locker = lockers.find(l => l.id === lockerId);
  if (!locker) return;
  locker.status = "ocupado";
  locker.employeeId = employeeId;
  return locker;
};
export const releaseLocker = (lockerId: string) => {
  const locker = lockers.find(l => l.id === lockerId);
  if (!locker) return;
  locker.status = "disponivel";
  locker.employeeId = undefined;
  return locker;
};
export const addLocker = (l: Omit<Locker, "id">) => {
  const locker = { ...l, id: genId() };
  lockers.push(locker);
  return locker;
};

// EPIs
export const getEPIs = () => [...epis];
export const addEPI = (e: Omit<EPI, "id">) => {
  const epi = { ...e, id: genId() };
  epis.push(epi);
  return epi;
};

// EPI Deliveries
export const getEPIDeliveries = () => [...epiDeliveries];
export const addEPIDelivery = (d: Omit<EPIDelivery, "id">) => {
  const epi = epis.find(e => e.id === d.epiId);
  if (epi) {
    epi.quantity = Math.max(0, epi.quantity - (d.quantity || 1));
  }
  const delivery = { ...d, id: genId() };
  epiDeliveries.push(delivery);
  return delivery;
};
export const returnEPI = (deliveryId: string) => {
  const d = epiDeliveries.find(x => x.id === deliveryId);
  if (!d) return;
  d.status = "devolvido";
  d.returnDate = new Date().toISOString().split("T")[0];
  const epi = epis.find(e => e.id === d.epiId);
  if (epi) {
    epi.quantity += d.quantity || 1;
  }
  return d;
};

// Dashboard helpers
export const getAlerts = () => {
  const alerts: { type: "error" | "warning"; message: string }[] = [];
  // Lockers assigned to terminated employees
  lockers.forEach(l => {
    if (l.employeeId) {
      const emp = employees.find(e => e.id === l.employeeId);
      if (emp && emp.status === "desligado") {
        alerts.push({ type: "error", message: `Armário ${l.number} vinculado ao ex-colaborador ${emp.name}` });
      }
    }
  });
  // Unreturned EPIs from terminated employees
  epiDeliveries.forEach(d => {
    if (d.status === "pendente_devolucao") {
      const emp = employees.find(e => e.id === d.employeeId);
      const epi = epis.find(e => e.id === d.epiId);
      if (emp && epi) {
        alerts.push({ type: "warning", message: `EPI "${epi.type}" pendente de devolução — ${emp.name}` });
      }
    }
  });
  return alerts;
};

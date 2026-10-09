import type { Appointment, Ritual } from "./appointment";

export interface ReportFilter {
  from: string;
  to: string;
  barberId: string;
  serviceId: string;
}

export function filterAppointments(
  appointments: readonly Appointment[],
  filter: ReportFilter,
): Appointment[] {
  return appointments.filter(
    (item) =>
      item.date >= filter.from &&
      item.date <= filter.to &&
      (!filter.barberId || item.barberId === filter.barberId) &&
      (!filter.serviceId || item.serviceId === filter.serviceId),
  );
}

export function summarize(
  appointments: readonly Appointment[],
  catalog: readonly Ritual[],
) {
  const completed = appointments.filter((item) => item.status === "completed");
  const revenue = completed.reduce((total, item) => total + item.price, 0);
  return {
    completed: completed.length,
    haircuts: completed.filter(
      (item) =>
        catalog.find((service) => service.id === item.serviceId)
          ?.includesHaircut,
    ).length,
    scheduled: appointments.filter((item) => item.status === "scheduled")
      .length,
    cancelled: appointments.filter((item) => item.status === "cancelled")
      .length,
    revenue,
    averageTicket: completed.length ? revenue / completed.length : 0,
    services: catalog.map((service) => ({
      ...service,
      count: completed.filter((item) => item.serviceId === service.id).length,
    })),
  };
}

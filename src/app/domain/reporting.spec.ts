import test from "node:test";
import assert from "node:assert/strict";
import { filterAppointments, summarize } from "./reporting.ts";
import type { Appointment, Ritual } from "./appointment.ts";

const catalog: readonly Ritual[] = [
  { id: "corte", includesHaircut: true },
  { id: "barba", includesHaircut: false },
  { id: "combo", includesHaircut: true },
  { id: "infantil", includesHaircut: true },
].map((item) => ({
  ...item,
  name: item.id,
  description: "",
  duration: 30,
  price: 0,
  image: "",
  alt: "",
}));
const appointments: Appointment[] = [
  {
    id: "1",
    serviceId: "corte",
    barberId: "lucas",
    date: "2026-10-01",
    status: "completed",
    price: 55,
  },
  {
    id: "2",
    serviceId: "barba",
    barberId: "rafael",
    date: "2026-10-02",
    status: "completed",
    price: 45,
  },
  {
    id: "3",
    serviceId: "combo",
    barberId: "lucas",
    date: "2026-10-03",
    status: "completed",
    price: 90,
  },
  {
    id: "4",
    serviceId: "infantil",
    barberId: "andre",
    date: "2026-10-03",
    status: "completed",
    price: 45,
  },
  {
    id: "5",
    serviceId: "corte",
    barberId: "lucas",
    date: "2026-10-03",
    status: "scheduled",
    price: 55,
  },
  {
    id: "6",
    serviceId: "combo",
    barberId: "andre",
    date: "2026-10-03",
    status: "cancelled",
    price: 90,
  },
].map((item) => ({
  ...item,
  clientName: "Cliente demo",
  phone: "",
  time: "09:00",
  duration: 30,
  createdAt: "2026-10-01T08:00:00-03:00",
})) as Appointment[];

test("counts only completed haircuts, with combo counted once and beard excluded", () => {
  const report = summarize(appointments, catalog);
  assert.equal(report.haircuts, 3);
  assert.equal(report.completed, 4);
  assert.equal(report.scheduled, 1);
  assert.equal(report.cancelled, 1);
});
test("revenue and average use completed records and historical prices", () => {
  const report = summarize(appointments, catalog);
  assert.equal(report.revenue, 235);
  assert.equal(report.averageTicket, 58.75);
  assert.equal(
    report.services.find((item) => item.id === "infantil")?.count,
    1,
  );
});
test("period includes both start and end dates", () => {
  const result = filterAppointments(appointments, {
    from: "2026-10-01",
    to: "2026-10-02",
    barberId: "",
    serviceId: "",
  });
  assert.deepEqual(
    result.map((item) => item.id),
    ["1", "2"],
  );
});
test("barber and service filters intersect", () => {
  const result = filterAppointments(appointments, {
    from: "2026-10-01",
    to: "2026-10-03",
    barberId: "lucas",
    serviceId: "combo",
  });
  assert.deepEqual(
    result.map((item) => item.id),
    ["3"],
  );
});
test("empty periods have zero totals without NaN", () => {
  const report = summarize([], catalog);
  assert.equal(report.revenue, 0);
  assert.equal(report.averageTicket, 0);
  assert.ok(report.services.every((item) => item.count === 0));
});

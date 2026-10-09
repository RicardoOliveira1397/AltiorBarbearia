import test from "node:test";
import assert from "node:assert/strict";
import {
  appointmentEnd,
  availableSlots,
  canChangeStatus,
  dateKey,
  isOpenDay,
  nextOpenDate,
  shiftDate,
  validDate,
} from "./scheduling.ts";

const now = new Date("2026-10-08T11:00:00Z"); // 08:00 in São Paulo.
const reserved = {
  id: "a",
  clientName: "Demo",
  phone: "",
  serviceId: "combo",
  barberId: "lucas",
  date: "2026-10-08",
  time: "10:00",
  duration: 60,
  price: 90,
  status: "scheduled",
  createdAt: now.toISOString(),
} as const;
const slots = (duration = 30, appointments = [reserved], barber = "lucas") =>
  availableSlots("2026-10-08", barber, duration, appointments, now);

test("a 60-minute reservation blocks both half-hour slots", () => {
  assert.equal(slots().find((item) => item.time === "10:00")?.available, false);
  assert.equal(slots().find((item) => item.time === "10:30")?.available, false);
  assert.equal(slots().find((item) => item.time === "11:00")?.available, true);
});
test("a longer service cannot overlap a reservation starting later", () => {
  assert.equal(
    slots(60).find((item) => item.time === "09:30")?.available,
    false,
  );
  assert.equal(
    slots(60).find((item) => item.time === "09:00")?.available,
    true,
  );
});
test("bookings for one barber do not block another", () =>
  assert.equal(
    slots(30, [reserved], "rafael").find((item) => item.time === "10:00")
      ?.available,
    true,
  ));
test("cancellation releases the full interval", () => {
  const cancelled = { ...reserved, status: "cancelled" as const };
  assert.equal(
    availableSlots(reserved.date, "lucas", 60, [cancelled], now).find(
      (item) => item.time === "10:00",
    )?.available,
    true,
  );
});
test("completed appointments continue occupying their original interval", () => {
  assert.equal(
    availableSlots(
      reserved.date,
      "lucas",
      30,
      [{ ...reserved, status: "completed" }],
      now,
    ).find((item) => item.time === "10:30")?.available,
    false,
  );
});
test("service duration respects lunch and closing boundaries", () => {
  const times = slots(60, []).map((item) => item.time);
  assert.ok(times.includes("11:00"));
  assert.ok(!times.includes("11:30"));
  assert.ok(!times.includes("12:00"));
  assert.ok(times.includes("18:00"));
  assert.ok(!times.includes("18:30"));
});
test("Sundays, past dates and dates beyond 30 days have no slots", () => {
  for (const date of ["2026-10-11", "2026-10-07", "2026-11-09"])
    assert.deepEqual(availableSlots(date, "lucas", 30, [], now), []);
});
test("elapsed slots today are unavailable, while later slots are available", () => {
  const values = availableSlots(
    "2026-10-08",
    "lucas",
    30,
    [],
    new Date("2026-10-08T13:15:00Z"),
  );
  assert.equal(values.find((item) => item.time === "10:00")?.available, false);
  assert.equal(values.find((item) => item.time === "10:30")?.available, true);
});
test("business dates follow São Paulo across midnight", () =>
  assert.equal(dateKey(new Date("2026-10-08T01:00:00Z")), "2026-10-07"));
test("after Saturday closing, the next open date is Monday", () =>
  assert.equal(nextOpenDate(new Date("2026-10-10T23:00:00Z")), "2026-10-12"));
test("invalid calendar dates are rejected", () => {
  assert.equal(validDate("2026-02-30"), false);
  assert.equal(isOpenDay("bad"), false);
  assert.equal(shiftDate("2026-12-31", 1), "2027-01-01");
});
test("the end timestamp includes the full service duration", () =>
  assert.equal(appointmentEnd(reserved), Date.parse("2026-10-08T14:00:00Z")));
test("future appointments cannot be completed", () =>
  assert.equal(canChangeStatus(reserved, "completed", now), false));
test("an appointment can be completed once its interval ends", () =>
  assert.equal(
    canChangeStatus(reserved, "completed", new Date("2026-10-08T14:00:00Z")),
    true,
  ));
test("cancellation is allowed before the appointment starts", () =>
  assert.equal(canChangeStatus(reserved, "cancelled", now), true));
test("finished and cancelled records cannot transition again", () => {
  assert.equal(
    canChangeStatus({ ...reserved, status: "completed" }, "cancelled", now),
    false,
  );
  assert.equal(
    canChangeStatus(
      { ...reserved, status: "cancelled" },
      "completed",
      new Date("2026-10-09T00:00:00Z"),
    ),
    false,
  );
});

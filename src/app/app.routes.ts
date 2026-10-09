import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    title: "Altior — Seu estilo, elevado.",
    loadComponent: () =>
      import("./features/landing/landing").then((m) => m.Landing),
  },
  {
    path: "agendar",
    title: "Seu momento — Altior",
    loadComponent: () =>
      import("./features/booking/booking").then((m) => m.Booking),
  },
  {
    path: "gestao",
    title: "Gestão — Altior",
    loadComponent: () =>
      import("./features/management/management").then((m) => m.Management),
  },
  { path: "**", redirectTo: "" },
];

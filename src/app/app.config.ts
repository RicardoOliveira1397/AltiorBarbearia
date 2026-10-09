import { ApplicationConfig, LOCALE_ID } from "@angular/core";
import { provideRouter, withHashLocation } from "@angular/router";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: "pt-BR" },
    provideRouter(routes, withHashLocation()),
  ],
};

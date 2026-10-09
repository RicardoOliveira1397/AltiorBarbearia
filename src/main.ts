import "zone.js";
import { registerLocaleData } from "@angular/common";
import pt from "@angular/common/locales/pt";
import { bootstrapApplication } from "@angular/platform-browser";
import { App } from "./app/app";
import { appConfig } from "./app/app.config";

registerLocaleData(pt);
// Preserve section URLs shared before the application gained hash-based routes.
if (/^#(inicio|essencia|espaco|rituais|detalhes|visita)$/.test(location.hash)) {
  history.replaceState(
    null,
    "",
    `${location.pathname}${location.search}#/${location.hash}`,
  );
}
bootstrapApplication(App, appConfig).catch(console.error);

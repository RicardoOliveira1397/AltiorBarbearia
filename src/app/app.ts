import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  template: '<router-outlet (activate)="scrollToTop()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // Section navigation stays with Lenis; only a new page resets native scroll.
  protected scrollToTop() {
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

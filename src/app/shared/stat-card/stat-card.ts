import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "altior-stat-card",
  template:
    '<article [class.featured]="featured()"><span class="label">{{ label() }}</span><strong>{{ value() }}</strong><p>{{ detail() }}</p><span class="corner" aria-hidden="true">↗</span></article>',
  styleUrl: "./stat-card.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly detail = input.required<string>();
  readonly featured = input(false);
}

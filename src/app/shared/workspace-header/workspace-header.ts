import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: "altior-workspace-header",
  imports: [RouterLink, RouterLinkActive],
  templateUrl: "./workspace-header.html",
  styleUrl: "./workspace-header.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceHeader {
  readonly management = input(false);
}

import { Component } from "@angular/core";
import { TailwindDemoComponent } from "./components/tailwind-demo/tailwind-demo.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [TailwindDemoComponent],
  template: `
    <app-tailwind-demo />
  `
})
export class AppComponent {}

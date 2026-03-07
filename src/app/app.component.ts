import { Component } from "@angular/core";
import { HomeComponent } from "./components/home/home.component";

@Component({
  selector: "mtx-root",
  imports: [HomeComponent],
  template: `
    <mtx-home />
  `
})
export class AppComponent { }

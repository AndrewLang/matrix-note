import { Component, input } from "@angular/core";

@Component({
  selector: "mtx-dialog-message",
  template: `
    <div class="space-y-2 p-4 text-sm text-gray-700 dark:text-gray-200">
      @if (message()) {
      <p>{{ message() }}</p>
      }
      @if (description()) {
      <p class="text-gray-500 dark:text-gray-400">{{ description() }}</p>
      }
    </div>
  `
})
export class DialogMessageComponent {
  readonly message = input("");
  readonly description = input("");
}

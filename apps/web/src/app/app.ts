import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** App shell: the router swaps the current page in here. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}

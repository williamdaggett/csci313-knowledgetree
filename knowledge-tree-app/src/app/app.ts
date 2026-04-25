import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { LogIn } from './Components/log-in/log-in';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, LogIn],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('knowledge-tree-app');
}

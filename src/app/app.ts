import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WebphoneComponent } from './components/webphone/webphone.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WebphoneComponent, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected title = 'rc-webphone-widget';
}

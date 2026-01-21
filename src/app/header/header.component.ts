import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  // TODO: Connect this to a real AuthService later
  isAuthenticated: boolean = false;

  toggleAuth() {
    this.isAuthenticated = !this.isAuthenticated;
  }
}

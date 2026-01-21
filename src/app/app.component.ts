import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common'; // Important for *ngIf
import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from "./side-bar/side-bar.component";
import { DashboardComponent } from './dashboard/dashboard.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SideBarComponent, DashboardComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'pharmacie';
  isAuthPage = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkAuthPage(event.url);
    });
  }

  private checkAuthPage(url: string) {
    // Basic check: if URL contains login or sign-up, it's an auth page
    // Note: redirect URLs or query params might affect this, but basic includes check is usually sufficient for simple apps
    this.isAuthPage = url.includes('/login') || url.includes('/sign-up');
  }
}

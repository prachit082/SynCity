import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  auth = inject(AuthService);

  // Helper to check if user is admin
  get isAdmin() {
    return this.auth.currentUser$.value?.role === 'admin';
  }

  // Helper to get username initials or name
  get username() {
    return this.auth.currentUser$.value?.username || 'User';
  }
}

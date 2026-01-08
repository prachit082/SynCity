import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import {
  PasswordChangeForm,
  UserProfile,
} from '../../../interfaces/user-profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  http = inject(HttpClient);
  auth = inject(AuthService);

  user: UserProfile = {
    _id: '',
    username: '',
    role: 'staff',
    theme: 'light',
    avatarSeed: 'default',
  };

  passwords: PasswordChangeForm = {
    current: '',
    new: '',
    confirm: '',
  };

  msg = '';
  errorMsg = '';

  ngOnInit() {
    this.loadProfile();
  }

  get headers() {
    const token = localStorage.getItem('access_token');
    return {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    };
  }

  loadProfile() {
    this.http
      .get<UserProfile>('http://localhost:5000/api/user/profile', this.headers)
      .subscribe({
        next: (data) => {
          this.user = data;
          this.applyTheme(this.user.theme);
        },
        error: () => (this.errorMsg = 'Failed to load profile'),
      });
  }

  get avatarUrl() {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.user.avatarSeed}`;
  }

  saveSettings() {
    this.http
      .put<UserProfile>(
        'http://localhost:5000/api/user/settings',
        {
          theme: this.user.theme,
          avatarSeed: this.user.avatarSeed,
        },
        this.headers
      )
      .subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.applyTheme(this.user.theme);
          this.msg = 'Settings Saved!';
          setTimeout(() => (this.msg = ''), 3000);
        },
        error: (err) => {
          if (err.status === 401) {
            alert('Your session has expired. Please login again.');
            this.auth.logout();
          } else {
            this.errorMsg = 'Failed to save settings';
          }
        },
      });
  }

  changePassword() {
    if (this.passwords.new !== this.passwords.confirm) {
      this.errorMsg = 'New passwords do not match';
      return;
    }

    this.http
      .put(
        'http://localhost:5000/api/user/password',
        {
          oldPassword: this.passwords.current,
          newPassword: this.passwords.new,
        },
        this.headers
      )
      .subscribe({
        next: () => {
          this.msg = 'Password Changed Successfully!';
          this.passwords = { current: '', new: '', confirm: '' };
        },
        error: (err) =>
          (this.errorMsg = err.error.error || 'Failed to change password'),
      });
  }

  applyTheme(theme: 'light' | 'dark') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }

  async randomizeAvatar() {
    this.user.avatarSeed = Math.random().toString(36).substring(7);
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { io } from 'socket.io-client';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
})
export class AdminPanelComponent implements OnInit {
  socket: any;
  systemState = { isActive: true, alertThreshold: 100 };
  newThreshold = 100;
  http = inject(HttpClient);

  ngOnInit() {
    this.socket = io('http://localhost:5000');

    // Listen for state updates
    this.socket.on('system-state', (state: any) => {
      this.systemState = state;
      this.newThreshold = state.alertThreshold; // Sync input box
    });

    this.fetchSystemState();
  }

  get headers() {
    const token = localStorage.getItem('access_token');
    return {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    };
  }

  fetchSystemState() {
    this.http
      .get('http://localhost:5000/api/admin/system', this.headers)
      .subscribe((data: any) => {
        this.systemState = data;
        this.newThreshold = data.alertThreshold;
      });
  }

  toggleSystem() {
    this.http
      .post('http://localhost:5000/api/admin/system/toggle', {}, this.headers)
      .subscribe((data: any) => {
        this.systemState = data;
      });
  }

  updateThreshold() {
    this.http
      .post(
        'http://localhost:5000/api/admin/system/threshold',
        { newThreshold: this.newThreshold },
        this.headers
      )
      .subscribe((data: any) => {
        this.systemState = data;
        alert('Threshold Updated!');
      });
  }
}

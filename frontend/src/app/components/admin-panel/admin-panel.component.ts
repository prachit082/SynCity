import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { io } from 'socket.io-client';

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

  ngOnInit() {
    this.socket = io('http://localhost:5000');
    
    // Listen for state updates
    this.socket.on('system-state', (state: any) => {
      this.systemState = state;
      this.newThreshold = state.alertThreshold; // Sync input box
    });
  }

  toggleSystem() {
    const command = this.systemState.isActive ? 'STOP' : 'START';
    this.socket.emit('toggle-system', command);
  }

  updateThreshold() {
    this.socket.emit('update-threshold', this.newThreshold);
  }
}

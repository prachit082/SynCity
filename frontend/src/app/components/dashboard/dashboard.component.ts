import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { io } from 'socket.io-client';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { Alert } from '../../../interfaces/alert.model';
import { AdminPanelComponent } from '../../components/admin-panel/admin-panel.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, BaseChartDirective, AdminPanelComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  auth = inject(AuthService);
  alerts: Alert[] = [];
  //Flashing State
  isCritical = false;
  //System State
  isSystemActive = true;
  //Admin Mode
  isAdminMode = false;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  socket: any;
  status = 'Disconnected';
  currentUsage = 0;

  // Chart Configuration
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [], // Time labels (x-axis)
    datasets: [
      {
        data: [], // Usage data (y-axis)
        label: 'Energy Consumption (kW)',
        fill: true,
        tension: 0.4, // Makes the line smooth (curved)
        borderColor: '#2563eb', // Blue line
        backgroundColor: 'rgba(37, 99, 235, 0.1)', // Light blue fill
      },
    ],
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    animation: false, // Disable animation for smoother real-time updates
    scales: {
      y: { min: 0, max: 120 }, // Fix the scale so it doesn't jump around
    },
  };

  ngOnInit() {
    this.fetchHistory();
    this.fetchRecentAlerts();

    this.socket = io(`http://localhost:5000`);

    this.socket.on('connect', () => {
      this.status = 'Live Connection';
    });

    this.socket.on('energy-update', (data: any) => {
      this.currentUsage = data.usage;
      this.updateChart(data);
    });

    this.socket.on('alert-incident', (alert: any) => {
      this.triggerVisualAlarm();
      this.alerts.unshift(alert);
      if (this.alerts.length > 5) this.alerts.pop();
    });

    this.socket.on('system-status', (isActive: boolean) => {
      this.isSystemActive = isActive;
      this.status = isActive ? 'Live Connection' : 'System Paused';
    });
  }

  get isAdmin() {
    return this.auth.isAdmin;
  }

  logout() {
    this.auth.logout();
  }

  updateChart(data: any) {
    const timeLabel = new Date(data.timestamp).toLocaleTimeString();

    // Add new data
    this.lineChartData.labels?.push(timeLabel);
    this.lineChartData.datasets[0].data.push(data.usage);

    // Keep only the last 20 readings
    if (this.lineChartData.labels && this.lineChartData.labels.length > 20) {
      this.lineChartData.labels.shift();
      this.lineChartData.datasets[0].data.shift();
    }

    this.chart?.update();
  }

  fetchHistory() {
    this.http.get<any[]>(`http://localhost:5000/api/history`).subscribe({
      next: (data) => {
        // Clear existing default data if any
        this.lineChartData.labels = [];
        this.lineChartData.datasets[0].data = [];

        // Loop through history and add to chart
        data.forEach((reading) => {
          const timeLabel = new Date(reading.timestamp).toLocaleTimeString();
          this.lineChartData.labels?.push(timeLabel);
          this.lineChartData.datasets[0].data.push(reading.usage);
        });

        this.chart?.update();
      },
      error: (err) => console.error('Failed to load history', err),
    });
  }

  fetchRecentAlerts() {
    this.http
      .get<any[]>('http://localhost:5000/api/alerts')
      .subscribe((data) => {
        this.alerts = data.slice(0, 6);
      });
  }

  triggerVisualAlarm() {
    this.isCritical = true;
    // Turn off red flash after 3 seconds
    setTimeout(() => (this.isCritical = false), 3000);
  }

  toggleSystem() {
    const command = this.isSystemActive ? 'STOP' : 'START';
    this.socket.emit('toggle-system', command);
  }
}

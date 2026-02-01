import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { io } from 'socket.io-client';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { Alert } from '../../../interfaces/alert.model';
import { AdminPanelComponent } from '../../components/admin-panel/admin-panel.component';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, BaseChartDirective, AdminPanelComponent, FormsModule],
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
  shiftNotes: any[] = [];
  newMessage: string = '';
  errorMsg: string = '';
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  socket: any;
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

    this.socket = io(environment.apiUrl);

    this.socket.on('energy-update', (data: any) => {
      this.currentUsage = data.usage;
      this.updateChart(data);
    });

    this.socket.on('alert-incident', (alert: any) => {
      this.triggerVisualAlarm();
      this.alerts.unshift(alert);
      if (this.alerts.length > 10) this.alerts.pop();
    });

    this.socket.on('alert-updated', (updatedAlert: any) => {
      const index = this.alerts.findIndex(
        (a) =>
          a.sensorId === updatedAlert.sensorId &&
          a.timestamp === updatedAlert.timestamp,
      );
      if (index !== -1) {
        this.alerts[index] = updatedAlert;
      } else {
        this.alerts.unshift(updatedAlert);
      }
    });

    this.socket.on('load-notes', (notes: any[]) => {
      this.shiftNotes = notes;
      this.scrollToBottom();
    });

    this.socket.on('new-note', (note: any) => {
      this.shiftNotes.push(note);
      setTimeout(() => {
        this.scrollToBottom();
      }, 50);
    });
  }

  get isAdmin() {
    return this.auth.isAdmin;
  }

  logout() {
    this.auth.logout();
  }

  scrollToBottom(): void {
    try {
      const element = this.scrollContainer.nativeElement;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth',
      });

      // element.scrollTop = element.scrollHeight;
    } catch (err) {}
  }

  updateChart(data: any) {
    const timeLabel = new Date(data.timestamp).toLocaleTimeString();

    // Add new data
    this.lineChartData.labels?.push(timeLabel);
    this.lineChartData.datasets[0].data.push(data.usage);

    // Keeping only the last 20 readings
    if (this.lineChartData.labels && this.lineChartData.labels.length > 20) {
      this.lineChartData.labels.shift();
      this.lineChartData.datasets[0].data.shift();
    }

    this.chart?.update();
  }

  fetchHistory() {
    this.http.get<any[]>(`${environment.apiUrl}/api/history`).subscribe({
      next: (data) => {
        // Clearing existing default data if any
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
      error: (err) => {
        if (err.status === 401) {
          alert('Your session has expired. Please login again.');
          this.auth.logout();
        } else {
          this.errorMsg = 'Failed to load history';
        }
      },
    });
  }

  fetchRecentAlerts() {
    this.http.get<any[]>(`${environment.apiUrl}/api/alerts`).subscribe({
      next: (data) => {
        this.alerts = data;
      },
      error: (err) => {
        if (err.status === 401) {
          alert('Your session has expired. Please login again.');
          this.auth.logout();
        } else {
          this.errorMsg = 'Failed to load alerts';
        }
      },
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

  downloadReport() {
    this.http.get<any[]>(`${environment.apiUrl}/api/reports/export`).subscribe({
      next: (data) => {
        this.generateCSV(data);
      },
      error: (err) => alert('Failed to download report'),
    });
  }

  generateCSV(data: any[]) {
    const headers = ['Sensor ID', 'Date', 'Time', 'Usage (kW)'];

    const rows = data.map((record) => {
      const dateObj = new Date(record.timestamp);
      return [
        record.sensorId,
        dateObj.toLocaleDateString('en-GB').replace(/\//g, '-'),
        dateObj.toLocaleTimeString(),
        record.usage,
      ].join(',');
    });

    // Combining Headers and Rows
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Creating a Blob (Fake File)
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    // Triggering Download via a hidden link
    const a = document.createElement('a');
    a.href = url;
    a.download = `SynCity_Energy_Report_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
  }

  resolveAlert(alertModel: any) {
    const note = prompt('Enter Maintenance Note (e.g., "Reset Breaker"):');
    if (!note) return;

    const currentUser = this.auth.currentUser$.value?.username || 'Staff';

    this.http
      .put(`${environment.apiUrl}/api/alerts/${alertModel._id}/resolve`, {
        status: 'Resolved',
        note: note,
        user: currentUser,
      })
      .subscribe({
        error: () => alert('Failed to update status'),
      });
  }

  postNote() {
    if (!this.newMessage.trim()) return;

    const currentUser = this.auth.currentUser$.value;

    this.socket.emit('send-note', {
      author: currentUser?.username || 'Unknown',
      role: currentUser?.role || 'staff',
      message: this.newMessage,
    });

    this.newMessage = '';
  }
}

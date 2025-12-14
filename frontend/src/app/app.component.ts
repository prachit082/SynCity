import { Component, OnInit, ViewChild } from '@angular/core';
import { io } from 'socket.io-client';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
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
        backgroundColor: 'rgba(37, 99, 235, 0.1)' // Light blue fill
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    animation: false, // Disable animation for smoother real-time updates
    scales: {
      y: { min: 0, max: 120 } // Fix the scale so it doesn't jump around
    }
  };

  ngOnInit() {
    this.socket = io('http://localhost:5000');

    this.socket.on('connect', () => {
      this.status = 'Live Connection';
    });

    this.socket.on('energy-update', (data: any) => {
      this.currentUsage = data.usage;
      this.updateChart(data);
    });
  }

  updateChart(data: any) {
    const timeLabel = new Date(data.timestamp).toLocaleTimeString();

    // Add new data
    this.lineChartData.labels?.push(timeLabel);
    this.lineChartData.datasets[0].data.push(data.usage);

    // Keep only the last 20 readings (Moving Window)
    if (this.lineChartData.labels && this.lineChartData.labels.length > 20) {
      this.lineChartData.labels.shift();
      this.lineChartData.datasets[0].data.shift();
    }

    // Tell Angular to redraw
    this.chart?.update();
  }
}

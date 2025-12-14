import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private socket: any;
  public energyData: any;
  public status = 'Disconnected';

  ngOnInit() {
    this.socket = io('http://localhost:5000');
    
    this.socket.on('connect', () => {
      this.status = 'Connected to IoT Grid';
    });

    this.socket.on('energy-update', (data: any) => {
      this.energyData = data;
    });
  }
}

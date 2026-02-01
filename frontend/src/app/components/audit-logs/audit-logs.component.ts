import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-logs.component.html',
})
export class AuditLogsComponent implements OnInit {
  http = inject(HttpClient);
  router = inject(Router);

  logs: any[] = [];
  loading = true;

  ngOnInit() {
    this.fetchLogs();
  }

  get headers() {
    const token = localStorage.getItem('access_token');
    return {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    };
  }

  fetchLogs() {
    this.http
      .get(`${environment.apiUrl}/api/admin/logs`, this.headers)
      .subscribe({
        next: (data: any) => {
          this.logs = data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
      });
  }
}

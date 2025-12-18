import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // <--- Required for Template Driven
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  auth = inject(AuthService);
  errorMsg = '';
  isLoading = false;

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    this.isLoading = true;
    this.errorMsg = '';

    const { username, password } = form.value;

    this.auth.login({ username, password }).subscribe({
      next: (res) => {
        this.auth.handleLoginSuccess(res);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMsg = err.error.error || 'Invalid Credentials';
        this.isLoading = false;
        form.reset();
      },
    });
  }
}

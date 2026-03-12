import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  view = signal<'login' | 'forgot'>('login');
  loginError = signal(false);
  showPassword = signal(false);

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, password } = this.form.value;
    const success = this.auth.login(username!, password!);
    if (success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.loginError.set(true);
    }
  }

  clearError(): void {
    this.loginError.set(false);
  }

  showForgot(): void {
    this.view.set('forgot');
  }

  backToLogin(): void {
    this.view.set('login');
    this.loginError.set(false);
  }

  get hint() {
    return this.auth.getCredentialHint();
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simulate API call
    setTimeout(() => {
      const { email, password } = this.loginForm.value;

      // Mock auth check (accept any valid email/password for demo)
      if (password === 'password') {
        // For demo purposes, password 'password' logs in successfully
        // In reality, this would check against a backend
        this.isLoading = false;
        this.router.navigate(['/']); // Go to dashboard
      } else {
        // Simulate error for other passwords (optional, or just allow all)
        // Let's actually just allow all for the UI demo to be smooth, 
        // or strictly check specific mock credentials if preferred.
        // For this task, "Mock authentication (no backend yet)" implies we just want the flow.

        this.isLoading = false;
        this.router.navigate(['/']); // Proceed to dashboard

        // Uncomment to test error state:
        // this.isLoading = false;
        // this.errorMessage = 'Invalid email or password';
      }
    }, 1500);
  }

  // Getters for easy access in template
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {

  // State
  currentStep: 1 | 2 = 1;
  selectedRole: 'pharmacy' | 'employee' | null = null;
  isLoading = false;

  // Forms
  pharmacyForm: FormGroup;
  employeeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    // Pharmacy Form
    this.pharmacyForm = this.fb.group({
      pharmacyName: ['', Validators.required],
      ownerName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });

    // Employee Form
    this.employeeForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      pharmacyCode: ['', Validators.required], // Unique code to link to pharmacy
      role: ['Pharmacist', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  // --- Step 1: Role Selection ---
  selectRole(role: 'pharmacy' | 'employee') {
    this.selectedRole = role;
    this.currentStep = 2;
  }

  // --- Navigation Helpers ---
  goBack() {
    this.currentStep = 1;
    this.selectedRole = null;
    this.pharmacyForm.reset();
    this.employeeForm.reset();
  }

  // --- Submission ---
  onSubmit() {
    const activeForm = this.selectedRole === 'pharmacy' ? this.pharmacyForm : this.employeeForm;

    if (activeForm.invalid) {
      activeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      console.log('Registered', this.selectedRole, activeForm.value);
      this.isLoading = false;
      this.router.navigate(['/login']); // Go to login after success
    }, 2000);
  }

  // Helper getters
  get pf() { return this.pharmacyForm.controls; }
  get ef() { return this.employeeForm.controls; }
}

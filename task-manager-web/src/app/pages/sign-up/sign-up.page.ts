import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: false,
})
export class SignUpPage implements OnInit {
  username = '';
  password = '';
  confirmPassword = '';
  name = '';
  email = '';
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {}

  register() {
    if (this.password == this.confirmPassword) {
      this.authService
        .register(this.username, this.password, this.name, this.email)
        .subscribe({
          next: () => {
            alert('Registro exitoso. Ahora puedes iniciar sesión.');
            this.router.navigate(['/login']);
          },
          error: (err) => {
            alert(
              'Error de registro: ' + (err.error?.error || 'Error desconocido'),
            );
          },
        });
    } else {
      alert('Las contraseñas no coinciden.');
    }
  }
}

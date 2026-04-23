import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

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
    private toastController: ToastController,
  ) {}

  ngOnInit() {}

  register() {
    if (this.password == this.confirmPassword) {
      this.authService
        .register(this.username, this.password, this.name, this.email)
        .subscribe({
          next: () => {
            this.presentToast(
              'Registro exitoso. Ahora puedes iniciar sesión.',
              'success',
            );
            this.router.navigate(['/login']);
          },
          error: (err) => {
            this.presentToast(
              'Error de registro: ' + (err.error?.error || 'Error desconocido'),
              'danger',
            );
          },
        });
    } else {
      alert('Las contraseñas no coinciden.');
    }
  }

  // Toast
  async presentToast(text: string, color: string) {
    const toast = await this.toastController.create({
      message: text,
      duration: 3000,
      color: color,
      position: 'bottom',
    });
    await toast.present();
  }
}

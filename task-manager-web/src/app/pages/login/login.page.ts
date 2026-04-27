import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { SignUpModalComponent } from '../sign-up-modal/sign-up-modal.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  username = '';
  password = '';
  constructor(
    private authService: AuthService,
    private router: Router,
    private modalCtrl: ModalController,
  ) {}
  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Login failed', err);
        alert('Error de inicio de sesión: usuario o contraseña incorrectos.');
      },
    });
  }
  /* signUpModal
   * Abre un modal en el cual se puede crear un nuevo usuario.
   */
  async signUpModal() {
    const modal = await this.modalCtrl.create({
      component: SignUpModalComponent,
    });
    await modal.present();
    modal.onDidDismiss().then(() => {});
  }
}

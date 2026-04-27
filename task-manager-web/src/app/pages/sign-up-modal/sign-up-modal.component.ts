import { ModalController, ToastController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-sign-up-modal',
  templateUrl: './sign-up-modal.component.html',
  styleUrls: ['./sign-up-modal.component.scss'],
  standalone: false,
})
export class SignUpModalComponent implements OnInit {
  username = '';
  password = '';
  confirmPassword = '';
  name = '';
  email = '';

  constructor(
    private modalCtrl: ModalController,
    private authService: AuthService,
  ) {}

  ngOnInit() {}

  cancel() {
    return this.modalCtrl.dismiss();
  }

  // Registrarse
  register() {
    if (this.password == this.confirmPassword) {
      this.authService
        .register(this.username, this.password, this.name, this.email)
        .subscribe({
          next: () => {
            this.presentToast('Account successfully created', 'success');
            return this.modalCtrl.dismiss();
          },
          error: (err) => {
            this.presentToast(
              'Register error: ' + (err.error?.error || 'Unknown error'),
              'error',
            );
          },
        });
    } else {
      this.presentToast('passwords dont match', 'error');
    }
  }

  // SweetAlert2
  presentToast(text: string, icon: SweetAlertIcon) {
    Swal.fire({
      heightAuto: false,
      theme: 'auto',
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      text: text,
      icon: icon,
    });
  }
}

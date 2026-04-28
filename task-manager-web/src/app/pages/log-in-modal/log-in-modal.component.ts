import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-log-in-modal',
  templateUrl: './log-in-modal.component.html',
  styleUrls: ['./log-in-modal.component.scss'],
  standalone: false,
})
export class LogInModalComponent implements OnInit {
  username = '';
  password = '';
  constructor(
    private authService: AuthService,
    private router: Router,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {}

  cancel() {
    return this.modalCtrl.dismiss();
  }

  login() {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/home']);
        this.modalCtrl.dismiss();
      },
      error: (err) => {
        this.presentToast('Incorrect User/Password', 'error');
      },
    });
  }

  presentToast(text: string, icon: SweetAlertIcon) {
    Swal.fire({
      heightAuto: false,
      theme: 'auto',
      position: 'bottom',
      toast: true,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      text: text,
      icon: icon,
    });
  }
}

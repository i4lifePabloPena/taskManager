import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SignUpModalComponent } from '../sign-up-modal/sign-up-modal.component';
import { LogInModalComponent } from '../log-in-modal/log-in-modal.component';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
  standalone: false,
})
export class StartPage {
  constructor(private modalCtrl: ModalController) {}
  /* signUpModal
   * Abre un modal en el cual se puede crear un nuevo usuario.
   */
  async signUpModal() {
    const modal = await this.modalCtrl.create({
      component: SignUpModalComponent,
    });
    await modal.present();
  }
  /* logInModal
   * Abre un modal donde uno puede logearse
   */
  async logInModal() {
    const modal = await this.modalCtrl.create({
      component: LogInModalComponent,
    });
    await modal.present();
  }
}

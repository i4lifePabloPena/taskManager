import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from 'src/app/services/auth.service';
import { ModalController } from '@ionic/angular';
import { ModalTagComponent } from '../modal-tag/modal-tag.component';
import { TagService, Tag } from '../../services/tag.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  tasks: Task[] = [];
  newTaskTitle: string = '';
  isAdmin: boolean = false;
  tags: Tag[] = [];
  filterStatus: number = -1;
  filterTag: any = 'All';
  uploadingTaskId: string | null = null;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private tagService: TagService,
  ) {}

  /* logout
   * Cierra sesión
   */
  logout() {
    this.tasks = [];
    this.newTaskTitle = '';
    this.isAdmin = false;
    this.authService.logout();
  }

  ngOnInit() {
    this.authService.isAdmin().subscribe((role) => {
      this.isAdmin = role == 'admin';
    });
  }

  ionViewWillEnter = () => {
    this.loadTasks();
    this.loadTags();
  };

  /* loadTags()
   * Carga todas las tags de la DB
   */
  loadTags() {
    this.tagService.getTags().subscribe((tags) => {
      this.tags = tags;
    });
  }

  /* filterTask
   * Filtra las tareas en función de las tags y el "status" de la tarea
   * Input: CustomEvent: idTag
   */

  filterTask(idTag: any) {
    this.filterTag = idTag;
    if (this.filterTag.detail.value == 'All') return this.loadTasks();
    this.taskService.getTasks(this.filterStatus).subscribe((allTasks) => {
      this.tasks = [];
      allTasks.forEach((task) => {
        if (!task.trash) {
          task.idTags?.forEach((tag) => {
            if (tag._id! == this.filterTag.detail.value) {
              this.tasks.push(task);
            }
          });
        }
      });
    });
  }

  /* loadTasks
   * Carga tareas de la DB filtrando en funcion del valor de "filterStatus", si es -1 carga todas.
   */
  loadTasks() {
    this.tasks = [];
    this.taskService.getTasks(this.filterStatus).subscribe((tasks) => {
      tasks.forEach((task) => {
        if (!task.trash) {
          this.tasks.push(task);
        }
      });
    });
  }

  /* changeFilterStatus
   * Cambia el estado de "filterStatus" y luego ejecuta loadTasks()
   * Input: number
   */
  changeFilterStatus(n: number) {
    this.filterStatus = n;
    this.filterTask(this.filterTag);
  }

  /* addTasks
   * Añade una nueva tarea a la DB, la añade al array "tasks" y ejecuta addTaskAlert()
   */
  addTask() {
    if (!this.newTaskTitle.trim()) return;
    this.taskService.addTask(this.newTaskTitle).subscribe((task) => {
      this.tasks.push(task);
      this.newTaskTitle = '';
      this.addTaskAlert();
    });
  }

  /* toggleTask
   * Cambia el estado de una tarea en la DB y luego actualiza el estado de la tarea
   * Input: Task
   */
  toggleTask(task: Task) {
    this.taskService.updateTask(task._id!).subscribe((updatedTask) => {
      task.status = updatedTask.status;
    });
  }

  // dateUpdate
  dateUpdate(task: Task, dueDate: any) {
    console.log(task);
    console.log(dueDate);
    const formattedDate = new Date(Date.parse(dueDate.detail.value));
    console.log(formattedDate);

    this.taskService
      .dateUpdate(task._id!, formattedDate)
      .subscribe((updatedTask) => {
        task.limitDate = updatedTask.limitDate;
      });
  }

  // colorDate
  colorDate(task: Task) {
    var color: string;
    const today: Date = new Date();
    const dueDate: Date = new Date(task.limitDate);
    color =
      dueDate.setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0)
        ? 'success'
        : 'danger';
    return color;
  }

  /* deleteTask
   * marca una tarea para eliminar
   * Input: Task
   */
  deleteTask(task: Task) {
    this.taskService.trashUpdate(task._id!).subscribe(() => {
      this.tasks = this.tasks.filter((t) => t._id != task._id);
    });
  }

  /* colorTask
   * Devuelve un String con el nombre de un color en funcion del estado de la tarea
   * Input: Task
   * Output: String
   */
  colorTask(task: Task) {
    let color: string;
    switch (task.status) {
      case 0:
        color = 'dark';
        break;
      case 1:
        color = 'warning';
        break;
      default:
        color = 'success';
    }
    return color;
  }

  // chip status
  statusChip(task: Task) {
    var textChip: string;
    switch (task.status) {
      case 0:
        textChip = 'To Do';
        break;
      case 1:
        textChip = 'Started';
        break;
      default:
        textChip = 'Completed';
    }
    return textChip;
  }

  /* openModal
   * Abre un modal asociado a una tarea, en el cual se puede trabajar con las tags
   * Input: Task
   */
  async openModal(task: Task) {
    const modal = await this.modalCtrl.create({
      component: ModalTagComponent,
      componentProps: {
        task,
      },
    });
    await modal.present();
    modal.onDidDismiss().then(() => {
      this.loadTasks();
      this.loadTags();
    });
  }

  // sweet alert 2
  addTaskAlert() {
    Swal.fire({
      heightAuto: false,
      title: 'Tarea Creada',
      icon: 'success',
      confirmButtonText: 'Nice',
      theme: 'auto',
    });
  }

  deleteTaskAlert(task: Task) {
    Swal.fire({
      heightAuto: false,
      title: 'DELETE TASK',
      text: 'The task will be moved to the trash',
      icon: 'question',
      confirmButtonText: 'Delete',
      showDenyButton: true,
      denyButtonText: 'Cancel',
      theme: 'auto',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteTask(task);
      }
    });
  }

  /* persoAlert
   * Alerta que se personaliza con los parametros introducidos
   * Input: title: string, text: string, icon: ?
   */
  persoAlert(title: string, text: string, icon: SweetAlertIcon) {
    Swal.fire({
      heightAuto: false,
      theme: 'auto',
      confirmButtonText: 'Oki doki',
      title: title,
      text: text,
      icon: icon,
    });
  }

  /* sendMail
   * Envia un correo, esto deberia estar en el back en "Templates"
   */
  sendMail(task: Task) {
    this.taskService.sendMail(task._id!).subscribe({
      next: (response) => {
        console.log('Correo enviado:', response);
        Swal.fire({
          heightAuto: false,
          title: 'Correo enviado',
          text: 'Se ha enviado un correo al dueño de la tarea.',
          icon: 'success',
          confirmButtonText: 'OK',
          theme: 'auto',
        });
      },
    });
  }
}

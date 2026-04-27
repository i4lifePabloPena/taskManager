import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from 'src/app/services/auth.service';
import { ModalController } from '@ionic/angular';
import { ModalTagComponent } from '../modal-tag/modal-tag.component';
import { TagService, Tag } from '../../services/tag.service';
import Swal, { SweetAlertIcon, SweetAlertInput } from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  tasks: any[] = [];
  allTasks: Task[] = [];
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

  /* Sistema de filtro por tags
   * Carga todas las tareas en otro array, vacia el original, compara todas las tags de cada tarea con la introducida,
   * si coinciden devuelve la tarea al array original.
   * Input: CustomEvent: idTag
   * by: chapuzarro
   */
  filterTasksChange(idTag: CustomEvent) {
    this.filterTag = idTag;
    this.filterTask();
  }

  filterTask() {
    console.log(this.filterTag.detail.value);
    if (this.filterTag.detail.value != 'All') {
      this.taskService
        .getTasks(this.filterStatus)
        .subscribe((allTasksComplete) => {
          this.allTasks = allTasksComplete;
          this.tasks = [];
          var isTag: boolean;
          this.allTasks.forEach((task) => {
            isTag = false;
            task.idTags?.forEach((tag) => {
              if (tag._id! == this.filterTag.detail.value) {
                isTag = true;
              }
            });
            if (isTag) {
              this.tasks.push(task);
            }
          });
        });
    } else {
      this.loadTasks();
    }
  }

  /* loadTasks
   * Carga tareas de la DB filtrando en funcion del valor de "filterStatus", si es -1 carga todas.
   */
  loadTasks() {
    this.taskService
      .getTasks(this.filterStatus)
      .subscribe((tasks) => (this.tasks = tasks));
  }

  /* changeFilterStatus
   * Cambia el estado de "filterStatus" y luego ejecuta loadTasks()
   * Input: number
   */
  changeFilterStatus(n: number) {
    this.filterStatus = n;
    this.loadTasks();
    this.filterTask();
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

  /* deleteTask
   * Borra una tarea de la DB
   * Input: Task
   */
  deleteTask(task: Task) {
    this.taskService.deleteTask(task._id!).subscribe(() => {
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
    this.isAdmin
      ? this.deleteTaskAlertAdmin(task)
      : this.deleteTaskAlertUser(task);
  }

  async deleteTaskAlertAdmin(task: Task) {
    const result = await Swal.fire({
      heightAuto: false,
      title: 'DELETE TASK',
      text: 'You really want to delete the task?',
      icon: 'question',
      input: 'checkbox',
      inputPlaceholder: `Send mail to the task owner`,
      inputValue: 0,
      confirmButtonText: 'Delete',
      showDenyButton: true,
      denyButtonText: 'Cancel',
      theme: 'auto',
    });
    if (result.isConfirmed) {
      this.deleteTask(task);
      if (result.value) {
        this.sendMail(task);
      }
    }
  }

  deleteTaskAlertUser(task: Task) {
    Swal.fire({
      heightAuto: false,
      title: 'DELETE TASK',
      text: 'You really want to delete the task?',
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

  /* IMG
   */
  onFileSelected(event: any, taskId: string) {
    const file: File = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.persoAlert('Solo se permiten imágenes', 'danger', 'success');
      return;
    }
    this.uploadingTaskId = taskId;
    const task = this.tasks.find((t) => t._id === taskId);
    if (task && task.url) {
      this.taskService.deleteFile(taskId).subscribe(() => {
        this.uploadNewFile(taskId, file);
      });
    } else {
      this.uploadNewFile(taskId, file);
    }
  }
  private uploadNewFile(taskId: string, file: File) {
    this.taskService.uploadFile(taskId, file).subscribe((response) => {
      const taskIndex = this.tasks.findIndex((t) => t._id === taskId);
      if (taskIndex > -1) {
        this.tasks[taskIndex] = response.task;
      }
      this.uploadingTaskId = null;
      this.persoAlert('Imagen subida correctamente', 'success', 'success');
      this.loadTasks();
    });
  }

  // File Delete
  async fileDelete(task: Task) {
    this.taskService.deleteFile(task._id!).subscribe((updatedTask) => {
      const taskIndex = this.tasks.findIndex((t) => t._id === task._id);
      this.tasks[taskIndex] = updatedTask;
      this.persoAlert('File deleted', 'success', 'success');
      this.loadTasks();
    });
  }
}

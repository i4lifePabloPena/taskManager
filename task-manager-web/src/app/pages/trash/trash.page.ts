import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Tag, TagService } from 'src/app/services/tag.service';
import { TaskService, Task } from 'src/app/services/task.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-trash',
  templateUrl: './trash.page.html',
  styleUrls: ['./trash.page.scss'],
  standalone: false,
})
export class TrashPage implements OnInit {
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
    this.taskService.getAllTasks(this.filterStatus).subscribe((allTasks) => {
      this.tasks = [];
      allTasks.forEach((task) => {
        if (task.trash) {
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
    this.taskService.getAllTasks(this.filterStatus).subscribe((tasks) => {
      tasks.forEach((task) => {
        if (task.trash) {
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

  /* deleteTask
   * Borra una tarea de la DB
   * Input: Task
   */
  deleteTask(task: Task) {
    this.taskService.deleteTask(task._id!).subscribe(() => {
      this.tasks = this.tasks.filter((t) => t._id != task._id);
    });
  }

  changeTrash(task: Task) {
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
      text: 'Do you really want to delete the task permanently?',
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
      text: 'Do you really want to delete the task permanently?',
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

import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from 'src/app/services/auth.service';
import { ModalController } from '@ionic/angular';
import { ModalTagComponent } from '../modal-tag/modal-tag.component';
import { TagService, Tag } from '../../services/tag.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  tasks: Task[] = [];
  allTasks: Task[] = [];
  newTaskTitle: string = '';
  isAdmin: boolean = false;
  tags: Tag[] = [];
  filterStatus: number = -1;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private modalCtrl: ModalController,
    private tagService: TagService,
  ) {}

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

  loadTags() {
    this.tagService.getTags().subscribe((tags) => {
      this.tags = tags;
    });
  }

  /* Sistema de filtro por tags
   * by: chapuzarro
   */
  filterTasks(idTag: CustomEvent) {
    if (idTag.detail.value != 'All') {
      this.taskService
        .getTasks(this.filterStatus)
        .subscribe((allTasksComplete) => {
          this.allTasks = allTasksComplete;
          this.tasks = [];
          var isTag: boolean;
          this.allTasks.forEach((task) => {
            isTag = false;
            task.idTags?.forEach((tag) => {
              if (tag._id! == idTag.detail.value) {
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

  loadTasks() {
    this.taskService
      .getTasks(this.filterStatus)
      .subscribe((tasks) => (this.tasks = tasks));
  }

  changeFilterStatus(n: number) {
    this.filterStatus = n;
    this.loadTasks();
  }

  addTask() {
    if (!this.newTaskTitle.trim()) return;
    this.taskService.addTask(this.newTaskTitle).subscribe((task) => {
      this.tasks.push(task);
      this.newTaskTitle = '';
      this.addTaskAlert();
    });
  }

  toggleTask(task: Task) {
    this.taskService.updateTask(task._id!).subscribe((updatedTask) => {
      task.status = updatedTask.status;
    });
  }

  deleteTask(task: Task) {
    this.taskService.deleteTask(task._id!).subscribe(() => {
      this.tasks = this.tasks.filter((t) => t._id != task._id);
    });
  }

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

  // modal tags
  async openModal(task: Task) {
    const modal = await this.modalCtrl.create({
      component: ModalTagComponent,
      componentProps: {
        task,
      },
    });
    await modal.present();
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
      error: (error) => {
        console.error('Error al enviar correo:', error);
        Swal.fire({
          heightAuto: false,
          title: 'Error',
          text: 'No se pudo enviar el correo.',
          icon: 'error',
          confirmButtonText: 'OK',
          theme: 'auto',
        });
      },
    });
  }
}

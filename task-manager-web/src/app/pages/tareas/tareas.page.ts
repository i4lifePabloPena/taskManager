import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.page.html',
  styleUrls: ['./tareas.page.scss'],
  standalone: false,
})
export class TareasPage implements OnInit {
  tasks: any[] = [];
  newTaskTitle: string = '';
  fileName = '';
  uploadingTaskId: string | null = null;
  isAdmin: boolean = false;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private toastController: ToastController,
  ) {}

  ngOnInit() {
    this.authService.isAdmin().subscribe((role) => {
      this.isAdmin = role == 'admin';
    });
  }

  ionViewWillEnter = () => {
    this.loadTasks(-1);
  };

  loadTasks(n: number) {
    this.taskService.getTasks(n).subscribe((tasks) => (this.tasks = tasks));
  }

  addTask() {
    if (this.newTaskTitle.trim() === '') return;
    this.taskService.addTask(this.newTaskTitle).subscribe((task) => {
      this.tasks.push(task);
      this.newTaskTitle = '';
    });
  }

  toggleTask(task: any) {
    this.taskService.updateTask(task._id).subscribe(); // , task.completed
  }

  deleteTask(id: string) {
    this.taskService.deleteTask(id).subscribe(() => {
      this.tasks = this.tasks.filter((t) => t._id !== id);
    });
  }

  colorTask(task: Task) {
    let color: string;
    switch (task.status) {
      case 0:
        color = 'default';
        break;
      case 1:
        color = 'warning';
        break;
      default:
        color = 'success';
    }
    return color;
  }

  /* Subida de archivos
    Esto, por lo que a mi respecta, funciona con mis sueños y esperanzas

    ToDo: Refactorizar
  */
  onFileSelected(event: any, taskId: string) {
    const file: File = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.presentToast('Solo se permiten imágenes', 'danger');
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
    this.taskService.uploadFile(taskId, file).subscribe(
      (response) => {
        const taskIndex = this.tasks.findIndex((t) => t._id === taskId);
        if (taskIndex > -1) {
          this.tasks[taskIndex] = response.task;
        }
        this.uploadingTaskId = null;
        this.presentToast('Imagen subida correctamente', 'success');
      },
      (error) => {
        this.uploadingTaskId = null;
        this.presentToast(
          error.error?.error || 'Error al subir la imagen',
          'danger',
        );
      },
    );
  }

  // File Delete
  async fileDelete(task: Task) {
    this.taskService.deleteFile(task._id!).subscribe((updatedTask) => {
      const taskIndex = this.tasks.findIndex((t) => t._id === task._id);
      this.tasks[taskIndex] = updatedTask;
      this.presentToast('File deleted', 'success');
    });
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

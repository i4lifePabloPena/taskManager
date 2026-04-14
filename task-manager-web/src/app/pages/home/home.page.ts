import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from 'src/app/services/auth.service';

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

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
  ) {}

  logout() {
    this.authService.logout();
  }

  ngOnInit() {
    this.authService.getUserRole().subscribe((role) => {
      this.isAdmin = role === 'admin';
    });
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => (this.tasks = tasks),
      error: (err) => {
        if (err.status === 403) {
          alert('No tienes permiso para acceder a estas tareas');
        } else {
          alert('Error al cargar tareas: ' + err.error?.error);
        }
      },
    });
  }

  addTask() {
    if (!this.newTaskTitle.trim()) return;
    this.taskService.addTask(this.newTaskTitle).subscribe({
      next: (task) => {
        this.tasks.push(task);
        this.newTaskTitle = '';
      },
      error: (err) => {
        alert('Error al crear tarea: ' + err.error?.error);
      },
    });
  }

  toggleTask(task: Task) {
    this.taskService.updateTask(task._id!).subscribe({
      next: (updatedTask) => {
        task.status = updatedTask.status;
      },
      error: (err) => {
        if (err.status === 403) {
          alert('No autorizado: no puedes modificar esta tarea');
        } else {
          alert('Error al actualizar tarea: ' + err.error?.error);
        }
      },
    });
  }

  deleteTask(task: Task) {
    this.taskService.deleteTask(task._id!).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t._id !== task._id);
      },
      error: (err) => {
        if (err.status === 403) {
          alert('No autorizado: no puedes eliminar esta tarea');
        } else {
          alert('Error al eliminar tarea: ' + err.error?.error);
        }
      },
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
}

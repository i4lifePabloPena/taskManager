import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from 'src/app/services/auth.service';
import { IonChip } from '@ionic/angular/standalone';

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
    this.tasks = [];
    this.newTaskTitle = '';
    this.isAdmin = false;
    this.authService.logout();
  }

  ngOnInit() {
    this.authService.isAdmin().subscribe((role) => {
      this.isAdmin = role == 'admin';
    });
    this.loadTasks(-1);
  }

  loadTasks(n: number) {
    this.taskService.getTasks(n).subscribe((tasks) => (this.tasks = tasks));
  }

  addTask() {
    if (!this.newTaskTitle.trim()) return;
    this.taskService.addTask(this.newTaskTitle).subscribe((task) => {
      this.tasks.push(task);
      this.newTaskTitle = '';
    });
  }

  toggleTask(task: Task) {
    this.taskService.updateTask(task._id!).subscribe((updatedTask) => {
      task.status = updatedTask.status;
    });
  }

  deleteTask(task: Task) {
    this.taskService.deleteTask(task._id!).subscribe(() => {
      this.tasks = this.tasks.filter((t) => t._id !== task._id);
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

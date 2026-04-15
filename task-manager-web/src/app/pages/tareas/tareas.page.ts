import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.page.html',
  styleUrls: ['./tareas.page.scss'],
  standalone: false,
})
export class TareasPage implements OnInit {
  tasks: any[] = [];
  newTaskTitle: string = '';
  constructor(private taskService: TaskService) {}
  ngOnInit() {
    this.loadTasks(-1);
  }
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
}

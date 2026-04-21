import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from 'src/app/services/auth.service';
import { ModalController } from '@ionic/angular';
import { ModalTagComponent } from '../modal-tag/modal-tag.component';
import { TagService, Tag } from '../../services/tag.service';

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
    this.loadTasks(-1);
    this.loadTags();
  };

  loadTags() {
    this.tagService.getTags().subscribe((tags) => {
      this.tags = tags;
    });
  }

  filterTasks(idTag: CustomEvent) {
    console.log('ionChange fired with value: ' + idTag.detail.value);
    // var idTags: string[] = idTag.detail.value;
    var test: String = idTag.detail.value;
    this.tasks.forEach((task) => {
      task.idTags?.forEach((tag) => {
        if (tag._id == idTag.detail.value)
          this.tasks.splice(this.tasks.indexOf(task), 1);
      });
    });
  }

  // filterTasks(event: CustomEvent) {
  //   this.tags.forEach((tag) => {
  //     console.log('ionChange fired with value: ' + event.detail.value);
  //   });
  // }

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

  // Chips
  chipStatus0() {
    let status: boolean;
    status = true;
    return status;
  }
}

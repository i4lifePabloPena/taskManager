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
}

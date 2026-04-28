import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TaskService, Task } from '../../services/task.service';
import { TagService, Tag } from '../../services/tag.service';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-tag',
  templateUrl: './modal-tag.component.html',
  styleUrls: ['./modal-tag.component.scss'],
  standalone: false,
})
export class ModalTagComponent implements OnInit {
  @Input() task!: Task;
  tags: Tag[] = [];
  selectedTagIds: string[] = [];
  newTagName: string = '';
  isAdmin: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private tagService: TagService,
    private authService: AuthService,
    private taskService: TaskService,
  ) {}

  ngOnInit() {
    this.authService.isAdmin().subscribe((role) => {
      this.isAdmin = role == 'admin';
    });
    this.loadTags();
  }

  loadTags() {
    this.tagService.getTags().subscribe((tags) => {
      this.tags = tags;
    });
  }

  assignTag() {
    this.taskService
      .assignTag(this.task._id!, this.selectedTagIds)
      .subscribe((updatedTask) => {
        this.task.idTags = updatedTask.idTags;
        this.selectedTagIds = [];
      });
  }

  deleteTagOnTasks(tag: Tag) {
    this.taskService.deleteTagOnTasks(tag._id!).subscribe((updatedTask) => {
      this.task.idTags = updatedTask.idTags;
    });
  }

  createTag() {
    this.tagService.createTag(this.newTagName.trim()).subscribe((newTag) => {
      this.tags.push(newTag);
      this.newTagName = '';
    });
  }

  exit() {
    return this.modalCtrl.dismiss();
  }

  deleteTag(tag: Tag) {
    this.tagService.deleteTag(tag._id!).subscribe(() => {
      this.tags = this.tags.filter((keepedTags) => keepedTags._id != tag._id);
    });
    this.deleteTagOnTasks(tag);
  }

  /* extractTag
   * Elimina la tag introducida de una task manteniendo el resto
   * Input: Tag
   */
  extractTag(inTag: Tag) {
    this.task.idTags!.forEach((tag) => {
      if (tag != inTag) this.selectedTagIds.push(tag._id!);
    });
    this.assignTag();
  }

  deleteTagAlertUser(tag: Tag) {
    Swal.fire({
      heightAuto: false,
      title: 'DELETE TAG',
      text: 'You really want to delete the tag?',
      icon: 'question',
      confirmButtonText: 'Delete',
      showDenyButton: true,
      denyButtonText: 'Cancel',
      theme: 'auto',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteTag(tag);
      }
    });
  }
}

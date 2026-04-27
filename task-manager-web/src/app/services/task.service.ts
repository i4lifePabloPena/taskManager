import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { Tag } from './tag.service';

export interface Task {
  _id?: string;
  title: string;
  status: number;
  url?: string;
  idTags?: Tag[];
}
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = environment.apiUrl + '/tasks';
  constructor(private http: HttpClient) {}

  // Obtener tareas
  getTasks(status?: number): Observable<Task[]> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
    let url = this.apiUrl;
    url += status != -1 ? `?status=${status}` : '?status=1&status=2&status=0'; // Si el valor es -1 devuelve la lista completa
    return this.http.get<Task[]>(url, { headers });
  }

  // Añadir tareas
  addTask(title: string): Observable<Task> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
    return this.http.post<Task>(this.apiUrl, { title }, { headers });
  }

  // Actualizar tareas
  updateTask(id: string): Observable<Task> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
    return this.http.put<Task>(`${this.apiUrl}/${id}`, {}, { headers });
  }

  // Subir archivo
  uploadFile(taskId: string, file: File): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${taskId}/upload`, formData, {
      headers,
    });
  }

  // Borrar archivo
  deleteFile(id: string): Observable<Task> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
    return this.http.delete<Task>(`${this.apiUrl}/img/${id}`, { headers });
  }

  // Borrar tareas
  deleteTask(id: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  // Asignar tags a tarea
  assignTag(taskId: string, tagIds: string[]): Observable<Task> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
    return this.http.put<Task>(
      `${this.apiUrl}/tag/${taskId}`,
      {},
      { headers, params: { idTags: tagIds.join(',') } },
    );
  }

  // Enviar correo al dueño de la tarea
  sendMail(taskId: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
    return this.http.post(
      `${this.apiUrl}/${taskId}/send-mail`,
      {},
      { headers },
    );
  }

  // Eliminar tag de todas las tasks
  deleteTagOnTasks(tagId: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
    return this.http.put<Task>(
      `${this.apiUrl}/tag/delete/${tagId}`,
      {},
      { headers },
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Tag {
  _id?: string;
  nameTag: string;
}

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private apiUrl = environment.apiUrl + '/tag';

  constructor(private http: HttpClient) {}

  // Obtener todas las tags
  getTags(): Observable<Tag[]> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
    return this.http.get<Tag[]>(this.apiUrl, { headers });
  }

  // Crear nueva tag
  createTag(nameTag: string): Observable<Tag> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
    return this.http.post<Tag>(this.apiUrl, { nameTag }, { headers });
  }

  // Eliminar tag
  deleteTag(id: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`,
    );
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }
}

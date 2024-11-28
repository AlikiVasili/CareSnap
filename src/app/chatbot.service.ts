import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:3000/chat'; // URL to your backend
  private apiUrlWiki = 'http://localhost:3000/wikiChat'

  constructor(private http: HttpClient) { }

  sendMessage(message: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { message });
  }

  sendWikiMessage(message: string): Observable<any> {
    return this.http.post<any>(this.apiUrlWiki, { message });
  }
  
}


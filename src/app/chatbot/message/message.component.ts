import { Component, inject, Input } from '@angular/core';
import { type Message } from '../message.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-message',
  standalone: true,
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {
  @Input({required: true}) message!: Message;
  // Inject the DomSanitizer service
  constructor(private sanitizer: DomSanitizer) {}

  // Getter to sanitize message text for safe HTML rendering
  get sanitizedMessage(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.message.text);
  }
}

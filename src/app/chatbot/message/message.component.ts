import { Component, inject, Input } from '@angular/core';
import { type Message } from '../message.model';
import { MessagesService } from '../messages.services';

@Component({
  selector: 'app-message',
  standalone: true,
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {
  @Input({required: true}) message!: Message;
  private messageServices = inject(MessagesService);
}

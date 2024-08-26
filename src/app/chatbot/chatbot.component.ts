import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../shared/card/card.component';
import { MessagesService } from './messages.services';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CardComponent, CommonModule, FormsModule],  // Include SharedModule here
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  constructor(private messagesService: MessagesService){}

  isSendingMessage = false;

  onSendingMessage(){
    this.isSendingMessage = true;
  }
}

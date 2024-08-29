import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../shared/card/card.component';
import { MessagesService } from './messages.services';
import { MessageComponent } from './message/message.component';
import { NewMessageData } from './message.model';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CardComponent, CommonModule, FormsModule, MessageComponent],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  userInput: string = '';
  constructor(private messageService: MessagesService){}

  get chatbotBodyMessages(){
    return this.messageService.getMessages();
  }

  onSendingMessage  (){
    if (this.userInput.trim()) {
      const newMessage: NewMessageData = {
        text: this.userInput,
        isUser: true,
      };
      this.messageService.addMessage(newMessage);
      this.userInput = '';
    }

    //Answer back to the user
    const chatbotAnswer: NewMessageData = {
      text: "Answer",
      isUser: false,
    };
    this.messageService.addMessage(chatbotAnswer);
  }

  // Function to detect Enter key press
  onEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSendingMessage();
    }
  }

}

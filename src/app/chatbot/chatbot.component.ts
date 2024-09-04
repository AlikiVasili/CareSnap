import { Component, ElementRef, ViewChild } from '@angular/core';
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
  @ViewChild('chatBody') private chatBody!: ElementRef;
  chatbotMessages: Array<any> = [];

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    if (this.chatBody) {
      try {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Failed to scroll', err);
      }
    }
  }

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

      // Scroll to the bottom after the message is added
      this.scrollToBottom();
    }

    // Answer back to the user
    const chatbotAnswer: NewMessageData = {
      text: "Answer",
      isUser: false,
    };
    this.messageService.addMessage(chatbotAnswer);
  }

  onEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSendingMessage();
    }
  }

}

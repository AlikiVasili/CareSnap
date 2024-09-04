import { HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../shared/card/card.component';
import { MessagesService } from './messages.services';
import { MessageComponent } from './message/message.component';
import { NewMessageData } from './message.model';
import { ChatbotService } from '../chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CardComponent, CommonModule, FormsModule, MessageComponent, HttpClientModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  userInput: string = '';
  @ViewChild('chatBody') private chatBody!: ElementRef;
  chatbotMessages: Array<any> = [];

  constructor(
    private messageService: MessagesService,
    private chatbotService: ChatbotService // Inject the ChatbotService
  ) {}

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

  get chatbotBodyMessages() {
    return this.messageService.getMessages();
  }

  onSendingMessage() {
    if (this.userInput.trim()) {
      const newMessage: NewMessageData = {
        text: this.userInput,
        isUser: true,
      };
      this.messageService.addMessage(newMessage);

      // Call the backend service
      this.chatbotService.sendMessage(this.userInput).subscribe({
        next: (response) => {
          // Add the response message from the backend
          const chatbotAnswer: NewMessageData = {
            text: response.response,
            isUser: false,
          };
          this.messageService.addMessage(chatbotAnswer);
          this.userInput = '';
          this.scrollToBottom();
        },
        error: (error) => {
          console.error('Error:', error);
          const errorMessage: NewMessageData = {
            text: 'Sorry, there was an error. Please try again later.',
            isUser: false,
          };
          this.messageService.addMessage(errorMessage);
        }
      });
    }
  }

  onEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSendingMessage();
    }
  }
}
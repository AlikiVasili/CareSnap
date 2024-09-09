import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../shared/card/card.component';
import { MessagesService } from './messages.services';
import { MessageComponent } from './message/message.component';
import { NewMessageData } from './message.model';
import { ChatbotService } from '../chatbot.service';
import { LoginFormComponent } from './login-form/login-form.component';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [LoginFormComponent,CardComponent, CommonModule, FormsModule, MessageComponent],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  userInput: string = '';
  @ViewChild('chatBody') private chatBody!: ElementRef;
  chatbotMessages: Array<any> = [];
  isLoggedIn: boolean = false; // Track login state
  showLoginForm: boolean = false;

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
      if(this.isLoggedIn){
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
      else{
        const errorMessage: NewMessageData = {
          text: 'LogIn First',
          isUser: false,
        };
        this.messageService.addMessage(errorMessage);
      }
    }
  }

  onEnterPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSendingMessage();
    }
  }

  onLoginButtonClick() {
    if(!this.isLoggedIn){
      this.showLoginForm = true; // Show the login form when the login button is clicked
    }
  }

  onLogoutButtonClick(){
    this.isLoggedIn = false;
    const logoutMessage: NewMessageData = {
      text: 'You logged out!',
      isUser: false,
    };
    this.messageService.addMessage(logoutMessage);
  }

  onLogin(userId: string) {
    this.isLoggedIn = true;
    this.showLoginForm = false;
    const loginMessage: NewMessageData = {
      text: 'You just LogIn as Maria Iosif!',
      isUser: false,
    };
    this.messageService.addMessage(loginMessage);
  }

  onCancelLogin() {
    this.showLoginForm = false; // Hide the login form when the user cancels
  }
}
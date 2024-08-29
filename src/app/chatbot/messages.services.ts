import { Injectable } from "@angular/core";
import { NewMessageData } from "./message.model";

@Injectable({
    providedIn: 'root'
})
export class MessagesService {
    private messages = [
        {
          id: '0',
          text: "Welcome I am CareSnap! How can I assist you today?",
          isUser: false
        }
    ];

    constructor(){
      const messages = localStorage.getItem('messages');
      
      if(messages){
        this.messages = JSON.parse(messages);
      }
    }

    getMessages(){
        return this.messages;
    }

    addMessage(messageData: NewMessageData){
      this.messages.push({
          id: new Date().getTime().toString(),
          text: messageData.text,
          isUser: messageData.isUser
        });
        this.saveMessages();
    }

    private saveMessages(){
      localStorage.setItem('tasks', JSON.stringify(this.messages));
    }
}
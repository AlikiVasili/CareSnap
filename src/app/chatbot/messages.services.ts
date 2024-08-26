import { Injectable } from "@angular/core";

export interface NewMessageData{
    text: string,
    who: string
}

@Injectable({
    providedIn: 'root'
})
export class MessagesService{
    private messages = [
        {
          text: 'Welcome! I am CareSnap!',
          who:'chatbot'
        }
    ];

    constructor(){
      const messages = localStorage.getItem('messages');
      
      if(messages){
        this.messages = JSON.parse(messages);
      }
    }

    addTask(messageData: NewMessageData){
      this.messages.unshift({
          text: messageData.text,
          who: messageData.who
        });
        this.saveChat();
    }

    private saveChat(){
      localStorage.setItem('messages', JSON.stringify(this.messages));
    }
}
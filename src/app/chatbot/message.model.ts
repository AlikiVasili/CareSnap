export interface Message{
    id: string,
    text: string,
    isUser: boolean
}

export interface NewMessageData{
    text: string
    isUser: boolean
}
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  standalone: true,
  imports: [FormsModule],
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {
  userId: string = '';

  @Output() login = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  onLogin() {
    if (this.userId.trim()) {
      this.login.emit(this.userId); // Emit the user ID on login
    }
  }

  onCancel() {
    this.cancel.emit(); // Emit the cancel event to close the form
  }
}

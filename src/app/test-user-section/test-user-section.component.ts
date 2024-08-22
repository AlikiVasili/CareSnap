import { Component } from '@angular/core';
import { CardComponent } from "../shared/card/card.component";

@Component({
  selector: 'app-test-user-section',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './test-user-section.component.html',
  styleUrl: './test-user-section.component.css'
})
export class TestUserSectionComponent {

}

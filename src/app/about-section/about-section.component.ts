import { Component } from '@angular/core';
import { CardComponent } from "../shared/card/card.component";

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.css'
})
export class AboutSectionComponent {

}

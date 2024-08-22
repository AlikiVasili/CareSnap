import { Component } from '@angular/core';
import { CardComponent } from "../shared/card/card.component";

@Component({
  selector: 'app-patient-summary-section',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './patient-summary-section.component.html',
  styleUrl: './patient-summary-section.component.css'
})
export class PatientSummarySectionComponent {

}

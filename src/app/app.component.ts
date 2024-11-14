import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { HeaderComponent } from './header/header.component';
import { AboutSectionComponent } from "./about-section/about-section.component";
import { PatientSummarySectionComponent } from "./patient-summary-section/patient-summary-section.component";
import { NcpehSectionComponent } from "./ncpeh-section/ncpeh-section.component";
import { TestUserSectionComponent } from "./test-user-section/test-user-section.component";
import { ChatbotComponent } from "./chatbot/chatbot.component";
import { FooterComponent } from "./footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,  // Add CommonModule here
    HeaderComponent,
    AboutSectionComponent,
    PatientSummarySectionComponent,
    NcpehSectionComponent,
    TestUserSectionComponent,
    ChatbotComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CareSnap-project';
  selectedMenuItemId = "i1";
  activeMenuItem: any;

  onSelectedMenuItem(id: string) {
    this.selectedMenuItemId = id;
  }
}
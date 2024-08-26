import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { AboutSectionComponent } from "./about-section/about-section.component";
import { MENU_ITEMS_LIST } from './menu_items_list';
import { MenuItemComponent } from "./menu-item/menu-item.component";
import { PatientSummarySectionComponent } from "./patient-summary-section/patient-summary-section.component";
import { NcpehSectionComponent } from "./ncpeh-section/ncpeh-section.component";
import { TestUserSectionComponent } from "./test-user-section/test-user-section.component";
import { ChatbotComponent } from "./chatbot/chatbot.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, AboutSectionComponent, MenuItemComponent, PatientSummarySectionComponent, NcpehSectionComponent, TestUserSectionComponent, ChatbotComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CareSnap-project';
  menuItems = MENU_ITEMS_LIST;
  selectedMenuItemId = "i1";

  get selectedMenuItem(){
    return this.menuItems.find((menuItem) => menuItem.id === this.selectedMenuItemId);
  }

  onSelectedMenuItem(id: string){
    this.selectedMenuItemId = id;
  }

}

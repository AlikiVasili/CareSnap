import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuItem } from './menu.model';
import { CardComponent } from "../shared/card/card.component";

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.css'
})
export class MenuItemComponent {
  @Input({required: true}) menuItem!: MenuItem;
  @Input ({required: true}) selected!: boolean;
  @Output() select = new EventEmitter<string>();

  onSelectedMenuItem(){
    this.select.emit(this.menuItem.id);
  }
}

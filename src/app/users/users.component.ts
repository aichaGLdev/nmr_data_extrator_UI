import { Component } from '@angular/core';
import {PyService} from "../service/py.service";

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  constructor(
    public service : PyService

  ) {service.getAdminUsers()}
  activateUser(userId: number) {
    this.service.activateUser(userId).subscribe(
      (response) => {
        console.log(response); // Affiche "User activated successfully" si tout s'est bien passé
        alert('User activated successfully');
        window.location.reload();
      },
      (error) => {
        console.error(error);
        alert('Failed to activate user');
      }
    );
  }

  deactivateUser(userId: number) {
    this.service.deactivateUser(userId).subscribe(
      (response) => {
        console.log(response); // Affiche "User deactivated successfully" si tout s'est bien passé
        alert('User deactivated successfully');
        window.location.reload();
      },
      (error) => {
        console.error(error);
        alert('Failed to deactivate user');
      }
    );
  }
}

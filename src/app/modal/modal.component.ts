import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import {PyService} from "../service/py.service";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    public service : PyService
  ) {}

  onClose(): void {
    this.service.upload()
    this.dialogRef.close();
  }

}


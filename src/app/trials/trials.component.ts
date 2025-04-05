import { Component } from '@angular/core';
import {PyService} from "../service/py.service";

@Component({
  selector: 'app-trials',
  templateUrl: './trials.component.html',
  styleUrl: './trials.component.css'
})
export class TrialsComponent {
  constructor(
    public service : PyService

  ) {service.getUserTrials()}

}

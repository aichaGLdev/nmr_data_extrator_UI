import {Component, OnInit} from '@angular/core';
import {PyService} from "../service/py.service";

@Component({
  selector: 'app-form-stepper',
  templateUrl: './form-stepper.component.html',
  styleUrls: ['./form-stepper.component.css']
})
export class FormStepperComponent {

  constructor(
    public service : PyService

  ) {

  }

// In your component
  getMultiplicitySuggestion(atom: any): string {
    return this.service.getMultiplicitySuggestions(atom.multiplicity_suggestion);
  }


}

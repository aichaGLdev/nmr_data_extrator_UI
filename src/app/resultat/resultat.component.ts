import { Component } from '@angular/core';
import {Matrice} from "../model/Matrice";
import {PyService} from "../service/py.service";

@Component({
  selector: 'app-resultat',
  templateUrl: './resultat.component.html',
  styleUrl: './resultat.component.css'
})
export class ResultatComponent {
 constructor(public service : PyService) {
 }
}

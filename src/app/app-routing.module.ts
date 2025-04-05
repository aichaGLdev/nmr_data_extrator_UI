import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {HomeComponent} from "./home/home.component";
import {RegisterComponent} from "./register/register.component";
import {FormStepperComponent} from "./form-stepper/form-stepper.component";
import {ResultatComponent} from "./resultat/resultat.component";
import {TrialsComponent} from "./trials/trials.component";
import {UsersComponent} from "./users/users.component";

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'case', component: FormStepperComponent },
  { path: 'result', component: ResultatComponent },
  { path: 'trial', component: TrialsComponent },
  { path: 'users', component: UsersComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

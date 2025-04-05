import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { FormStepperComponent } from './form-stepper/form-stepper.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {provideToastr} from "ngx-toastr";
import { ResultatComponent } from './resultat/resultat.component';
import { ChartComponent } from './chart/chart.component';
import { ModalComponent } from './modal/modal.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TrialsComponent } from './trials/trials.component';
import { UsersComponent } from './users/users.component';

@NgModule({
  declarations: [
    AppComponent,
    FormStepperComponent,
    HomeComponent,
    HeaderComponent,
    LoginComponent,
    RegisterComponent,
    ResultatComponent,
    ChartComponent,
    ModalComponent,
    TrialsComponent,
    UsersComponent

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    provideClientHydration(),
    HttpClient,
    provideToastr(),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

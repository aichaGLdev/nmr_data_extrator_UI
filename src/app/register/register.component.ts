import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from "../service/authentication.service";
import {ToastrService} from "ngx-toastr";
import {RegistrationRequest} from "../model/RegistrationRequest";
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  registerRequest: RegistrationRequest = {email: '', firstname: '', lastname: '', password: ''};
  errorMsg: Array<string> = [];

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private toastr: ToastrService
  ) {
  }

  login() {
    this.router.navigate(['login']);
  }

  register() {
    this.errorMsg = [];
    this.authService.register(
      this.registerRequest
    )
      .subscribe({
        next: () => {
          this.router.navigate(['login']);
        },
        error: (err:any) => {
          this.toastr.warning("All fields are required")
          this.errorMsg = err.error.validationErrors;
        }
      });
  }
}

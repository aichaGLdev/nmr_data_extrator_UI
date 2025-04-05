import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {RegistrationRequest} from "../model/RegistrationRequest";
import {Observable} from "rxjs";
import {AuthenticationRequest} from "../model/AuthenticationRequest";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = environment.apiUrl ; // Base URL for backend API
  constructor(private http: HttpClient) { }
  register(request: RegistrationRequest): Observable<any> {
    const url = `${this.apiUrl}/register`;
    return this.http.post(url, request, {responseType: "arraybuffer", headers: new HttpHeaders({ 'Content-Type': 'application/json' }) });
  }
  authenticate(body: AuthenticationRequest ):Observable<any> {
    const url=`${this.apiUrl}/authenticate`;
    return this.http.post(url,body)
  }
  confirm( token: string ): Observable<void> {
    const url=`${this.apiUrl}/activate-account`;
    const params = new HttpParams().set('token', token);
    return this.http.get<void>(url, { params });
  }
}

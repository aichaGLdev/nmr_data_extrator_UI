import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationRequest} from "../model/AuthenticationRequest";
import {AuthenticationService} from "../service/authentication.service";
import {TokenService} from "../service/token.service";
import {ToastrService} from "ngx-toastr";
import {concatMap, forkJoin, Observable, of, switchMap} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  authRequest: AuthenticationRequest = {email: '', password: ''};
  errorMsg: Array<string> = [];

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private tokenService: TokenService,
    private toastr: ToastrService,
    private http: HttpClient

  ) {

  }

  login() {
    this.errorMsg = [];
    this.authService.authenticate(
      this.authRequest
    ).subscribe({
      next: (res) => {
        this.tokenService.userId = res.userId as any
        this.tokenService.token = res.token as string
        //console.log("resultat user ", res)
        // Vérifier si le premier élément de roleIds est égal à 2
        if (res.roleIds && res.roleIds.length > 0 && res.roleIds[0] === 2) {
          this.router.navigate(['users']);
        } else {
          this.router.navigate(['case']); // Autre redirection par défaut
        }
      },
      error: (err) => {
        console.log(err);
        if (err.error.validationErrors) {
          this.errorMsg = err.error.validationErrors;
        } else {
          this.errorMsg.push(err.error.errorMsg);
        }
        this.toastr.warning("Invalid login or password")
      }
    });
  }

  register() {
    this.router.navigate(['register']);
  }

  saveMolecule(id: number): Observable<any> {
    // Récupérer les données du localStorage
    const storedAtomsList = localStorage.getItem('fullmolecul');

    if (storedAtomsList) {
      // Convertir en objet JSON
      const fullmolecul = JSON.parse(storedAtomsList);

      // Extraire la formule chimique si elle est présente dans atomsList
      const chimicalFormula = fullmolecul.mf || ''; // Remplacez par la clé correcte si ce n'est pas 'mf'
      console.log("atomsList.mf", fullmolecul.mf);
      // Créer l'objet JSON attendu par le backend
      const moleculeRequestBody = {
        chimicalformula: chimicalFormula, // Ajouter la formule chimique
        atomsList: fullmolecul // Le tableau des atomes est placé sous une clé appropriée
      };

      // Configurer les en-têtes si nécessaire
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      // Enchaîner les appels avec concatMap pour les exécuter dans l'ordre
      return this.http.post<any>(`http://localhost:8088/api/v1/trail/saveMolecule/${id}`, moleculeRequestBody, { headers })
        .pipe(
          concatMap((response: any) => {
            const moleculeId = response.idMolecule;
            console.log('Molecule ID:', moleculeId);
            this.saveAtoms(moleculeId);

            //this.saveImposedFragments(moleculeId);
            //this.saveForbiddenFragments(moleculeId);
            return this.saveCorrilation(moleculeId);

          })
        );
    } else {
      console.error('No atomsList found in localStorage.');
      return of(null); // Retourner un Observable vide en cas d'absence de données
    }
  }


  saveAtoms(moleculeId: number): Observable<any> {
    const storedAtomsList = localStorage.getItem('fullmolecul');
    if (storedAtomsList) {
      // Convertir en objet JSON
      const fullmolecul = JSON.parse(storedAtomsList);
      const atomsData = fullmolecul.atoms.map((atom: any) => ({
        index: atom.index,
        symbol: atom.symbol,
        multiplicity: atom.multiplicity,
        hybridization: atom.hybridization,
        nmr_shift: atom.nmrShift
      }));
      // Créer l'objet JSON attendu par l'API
      const requestBody = {
        atoms: atomsData
      };
      return this.http.post<any>(`http://localhost:8088/api/v1/trail/saveAtoms/${moleculeId}`, requestBody);
    }else {
      console.error('No atomsList found in localStorage.');
      return of(null); // Retourner un Observable vide en cas d'absence de données
    }

  }
  saveCorrilation(moleculeId: number): Observable<any> {
    const storedcorrelations = localStorage.getItem('correlationsDet');

    if (storedcorrelations) {
      // Convertir en objet JSON
      const fullcorrelations = JSON.parse(storedcorrelations);
      console.log("correlations from localStorage", fullcorrelations);

      // Assumer que la structure est un tableau contenant un tableau
      const correlationsArray = fullcorrelations[0] || [];

      // Mapper les données correctement
      const correlationData = correlationsArray.map((correlation: any) => ({
        atomSet1: correlation.atom1_index,
        atomSet2: correlation.atom2_index,
        correlationType: correlation.correlation_type
      }));

      // Créer l'objet de données pour saveCorrilation
      const dataToSend = { corrilation: correlationData };

      // Configurer les en-têtes si nécessaire
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      // Envoyer la requête POST avec les données
      return this.http.post<any>(`http://localhost:8088/api/v1/trail/saveCorrilation/${moleculeId}`, dataToSend, { headers });
    } else {
      console.error('No correlations found in localStorage.');
      return of(null); // Retourner un Observable vide si aucune donnée
    }
  }


  saveImposedFragments(moleculeId: number): Observable<any> {
    const imposedFragmentsData = { /* votre objet de données pour saveImposedFragments */ };
    return this.http.post<any>(`http://localhost:8088/api/v1/trail/saveImposedFragments/${moleculeId}`, imposedFragmentsData);
  }

  saveForbiddenFragments(moleculeId: number): Observable<any> {
    const forbiddenFragmentsData = { /* votre objet de données pour saveForbiddenFragments */ };
    return this.http.post<any>(`http://localhost:8088/api/v1/trail/saveForbiddenFragments/${moleculeId}`, forbiddenFragmentsData);
  }


}

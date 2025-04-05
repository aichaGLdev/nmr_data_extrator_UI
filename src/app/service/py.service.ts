import {Injectable, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Correlation} from "../model/Correlation";
import {ModalComponent} from "../modal/modal.component";
import {Matrice} from "../model/Matrice";
import {Router} from "@angular/router";
import {catchError, concatMap, Observable, of, tap, throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PyService {
  MolecularFormula!: FormGroup;
  Spectrums!: FormGroup;
  AtomsDetails!: FormGroup;
  AtomsCorrelations!: FormGroup;
  MoleculFragments!: FormGroup;
  molecular_formula_step = false;
  atom_step = false;
  hydrogen_step = false;
  correlations_step = false;
  fragments_step = false;
  step = 1;
  parsedMolecules: any[] = [];
  showAtomDetails: boolean = false;
  atomsDetailsList: any[] = [];
  atomsList: any[] = [];
  correlationsList: any[] = [];
  apiUrlV2 = environment.apiUrlV2
  multiplicitySuggestions: string[] = [];
  atom2Suggestions: string[] = [];
  adjacencyMatrices: number[][][] = [];
  userMolecules: any[] = [];
  AdminUsers: any[] = [];
  isLoading = false
  hydrogens: { integral: number; shift: number }[] = [];
  constructor(

    private formBuilder: FormBuilder ,
    public dialog: MatDialog,
    private http: HttpClient,
    private router: Router
  ) {
    this.ngOnInit()
  }

  ngOnInit() {
    this.Spectrums = this.formBuilder.group({
      C: [null, Validators.required],
      H: [null, Validators.required]
    });
    this.MolecularFormula = this.formBuilder.group({
      mf: ['', Validators.required] // mf est le nom du contrôle de formulaire et peut etre accessible via this.MolecularFormula.get('mf')
      /*C: [null, Validators.required],
      H: [null, Validators.required]*/
    });

    this.AtomsDetails = this.formBuilder.group({
      atomControls: this.formBuilder.array([]) // Créer un FormArray pour les atomes
    });
    this.AtomsCorrelations = this.formBuilder.group({
      corr_nbr: [null],
      correlationsControls: this.formBuilder.array([]) // Créer un FormArray pour les atomes
    });

    this.MoleculFragments = this.formBuilder.group({
      imposed_fragments: this.formBuilder.array([]),
      forbidden_fragments: this.formBuilder.array([]),
    });

  }
  get spectrums() { return this.Spectrums.controls; }
  get atomControls() {
    return this.AtomsDetails.get('atomControls') as FormArray;
  }
  get correlationsControls() {
    return this.AtomsCorrelations.get('correlationsControls') as FormArray;
  }
  get molecularformula() { return this.MolecularFormula.controls; }

  next() {
    if (this.step == 1) {
      this.molecular_formula_step = true;
      if (this.MolecularFormula.invalid) { return; }
      this.step++;
    } else if (this.step == 2) {
      this.atom_step = true;
      if (this.AtomsDetails.invalid) { return; }
      this.step++;
    } else if (this.step == 3) {
      this.hydrogen_step = true;
      this.step++;
    }else if (this.step == 4) {
      this.correlations_step = true;
      if (this.AtomsCorrelations.invalid) { return; }
      this.step++;
    }
  }

  previous() {
    this.step--;
    if (this.step == 1) {
      this.atom_step = false;
    } else if (this.step == 2) {
      this.hydrogen_step = false;
    } else if (this.step == 3) {
      this.correlations_step = false;
    } else if (this.step == 4) {
      this.fragments_step = false;
    }
  }

  onNextButtonClick(): void {
    const mfControl = this.molecularformula['mf'];
    if (mfControl && mfControl.value) {
      this.parsedMolecules = this.parseMolecularFormula(mfControl.value);
      this.showAtomDetails = true;
      this.initializeAtomControls(); // Initialiser les contrôles des atomes
      this.next();
    } else {
      // Gérer le cas où le contrôle est null ou vide
      console.error("Molecular formula is required.");
    }
  }
  initializeAtomControls() {
    const atomArray = this.atomControls;
    atomArray.clear(); // Réinitialiser le FormArray

    this.parsedMolecules.forEach(molecule => {
      const atomGroup = this.formBuilder.group({
        mult: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
        hyb: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
        nmr_shift: [null, [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
        multiplicity_suggestions: [null] // Ajouter le champ multiplicity_suggestions
      });
      atomArray.push(atomGroup);
    });
  }

  initializeAtomCorrelations() {
    const correlationsArray = this.correlationsControls;
    correlationsArray.clear(); // Réinitialiser le FormArray


    for (let i = 0; i < this.AtomsCorrelations.controls['corr_nbr'].value; i++) {
      const atomGroup = this.formBuilder.group({
        atom1_index: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
        atom2_index: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
        //atom2_suggestion: [null],
        correlation_type: ['', Validators.required]
      });
      correlationsArray.push(atomGroup);
    }
  }
  onCheckboxChange(e: any, type: 'imposed' | 'forbidden') {
    const checkArray: FormArray = this.MoleculFragments.get(type === 'imposed' ? 'imposed_fragments' : 'forbidden_fragments') as FormArray;

    if (e.target.checked) {
      checkArray.push(this.formBuilder.control(e.target.value));
    } else {
      const index = checkArray.controls.findIndex(x => x.value === e.target.value);
      checkArray.removeAt(index);
    }
  }
  submit() {
    const imposedFragments = this.getCheckboxValues(this.MoleculFragments.controls['imposed_fragments'].value);
    const forbiddenFragments = this.getCheckboxValues(this.MoleculFragments.controls['forbidden_fragments'].value);

    const fragments = {
      forbiddenFragments: forbiddenFragments,
      imposedFragments: imposedFragments,
    };
    this.atomsDetailsList = [...this.atomsDetailsList,  fragments ];
    console.log(this.atomsDetailsList);
    return this.atomsDetailsList;

  }

  private getCheckboxValues(values: string[]): any {
    return {
      threecycle: values.includes('threecycle'),
      fourcycle: values.includes('fourcycle'),
      fivecycle: values.includes('fivecycle'),
      sixcycle: values.includes('sixcycle'),
    };
  }
  captureAtomsDetails() {
    this.atomsDetailsList = this.parsedMolecules.map((molecule, index) => {
      const atomControl = this.atomControls.at(index);

      // Vérification de nullité pour chaque contrôle
      const mult = atomControl?.get('mult')?.value ?? null;
      const hyb = atomControl?.get('hyb')?.value ?? null;
      const nmr_shift = atomControl?.get('nmr_shift')?.value ?? null;

      return {
        index: molecule.index,
        symbol: molecule.symbol,
        valency: molecule.valency,
        mult: mult,
        hyb: hyb,
        nmr_shift: nmr_shift
      };
    });
    // Copier atomsDetailsList dans la variable globale atomsList
    this.atomsList = [...this.atomsDetailsList];
    //this.initializeAtomCorrelations()
    this.next();
    console.log(this.atomsDetailsList);
  }
  captureAtomsCorrelations() {
    const correlations:  Correlation [] = []; // Créer un tableau pour stocker les corrélations avec le type explicitement défini

    for (let i = 0; i < this.AtomsCorrelations.controls['corr_nbr'].value; i++) {
      const correlationsControls = this.correlationsControls.at(i);
      const atom1_index = correlationsControls?.get('atom1_index')?.value ?? null;
      const atom2_index = correlationsControls?.get('atom2_index')?.value ?? null;
      const correlation_type = correlationsControls?.get('correlation_type')?.value ?? '';

      correlations.push({
        atom1_index: atom1_index,
        atom2_index: atom2_index,
        correlation_type: correlation_type
      });
    }
    this.correlationsList= [correlations];
    // Ajouter les corrélations à atomsDetailsList
    this.atomsDetailsList = [...this.atomsDetailsList, { correlations }];
    localStorage.setItem('correlationsDet', JSON.stringify(this.correlationsList));
    this.next();
    console.log(this.atomsDetailsList);
    return this.atomsDetailsList;
  }


  parseMolecularFormula(formula: string): any[] {
    const ignoreElements = ['H'];
    const elementRegex = /([A-Z][a-z]?)(\d*)/g;
    const valencyMap: { [key: string]: number } = {
      'C': 4,
      'O': 2,
    };
    const result: any[] = [];
    let match;
    let currentIndex = 1;

    while ((match = elementRegex.exec(formula)) !== null) {
      const element = match[1];
      const quantity = match[2] ? parseInt(match[2], 10) : 1;

      if (!ignoreElements.includes(element)) {
        for (let i = 0; i < quantity; i++) {
          result.push({
            index: currentIndex++,
            symbol: element,
            valency: valencyMap[element] || 1
          });
        }
      }
    }
    return result;
  }


  submitAllSolutions() {
    const imposedFragments = this.getCheckboxValues(this.MoleculFragments.controls['imposed_fragments'].value);
    const forbiddenFragments = this.getCheckboxValues(this.MoleculFragments.controls['forbidden_fragments'].value);

    const fragments = {
      forbiddenFragments: forbiddenFragments,
      imposedFragments: imposedFragments,
    };

    // Transformez correlationsList en la structure souhaitée
    const atomSet1: number[] = [];
    const atomSet2: number[] = [];
    const correlationTypes: string[] = [];

    this.correlationsList.forEach((correlationGroup: Correlation[]) => {
      correlationGroup.forEach((correlation: Correlation) => {
        if (correlation.atom1_index != null) {
          atomSet1.push(correlation.atom1_index);
        }
        if (correlation.atom2_index != null) {
          atomSet2.push(correlation.atom2_index);
        }
        if (correlation.correlation_type != null) {
          correlationTypes.push(correlation.correlation_type);
        }
      });
    });

    // Pour chaque type de corrélation unique, associez un tableau d'atomSet1 et atomSet2
    const uniqueCorrelationTypes = [...new Set(correlationTypes)];

    const correlationObject = uniqueCorrelationTypes.map(correlationType => ({
      atomSet1: atomSet1.filter((_, index) => correlationTypes[index] === correlationType),
      atomSet2: atomSet2.filter((_, index) => correlationTypes[index] === correlationType),
      correlationType
    }));

    const formData = {
      name: "buttan", // Example name
      mf: this.MolecularFormula.get('mf')?.value,
      desc: 'Your description here', // Adjust as needed
      atoms: this.atomsList.map((atom: any) => ({
        index: atom.index,
        symbol: atom.symbol,
        valence: atom.valency,
        multiplicity: atom.mult,
        hybridization: atom.hyb,
        nmrShift: atom.nmr_shift
      })),
      forbiddenFragments: fragments.forbiddenFragments,
      imposedFragments: fragments.imposedFragments,
      correlations: correlationObject
    };
    // Save atomsList to localStorage
    localStorage.setItem('fullmolecul', JSON.stringify(formData));
    //localStorage.setItem('newTrial',"true");

    this.http.post<Matrice>(`${this.apiUrlV2}/submit-all-solutions`, formData)
      .subscribe((response: Matrice) => {
        console.log('All solutions submitted:', response, 'your data', formData);
        this.adjacencyMatrices = response.data; // Utiliser la propriété 'data' de la réponse
        console.log('adjacencyMatrices', this.adjacencyMatrices);
        // Redirection vers /result après succès
        this.router.navigate(['/result']);
      }, error => {
        console.error('Error submitting all solutions:', error, 'your data', formData);
      });
  }


  openModal(): void {
    this.dialog.open(ModalComponent, {
      width: '500px',
      height: '300px',
      position: {
        top: '10%',   // Adjust these values if necessary
        left: '30%'   // Adjust these values if necessary
      }
    });

  }
  selectedFiles: { C?: File; H?: File } = {};
  onFileChange(event: Event, fileType: 'C' | 'H'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFiles[fileType] = input.files[0];
      console.log(`${fileType} file selected:`, this.selectedFiles[fileType]);
      this.Spectrums.get(fileType)?.setValue(this.selectedFiles[fileType]);
    }
  }

  upload(): void {
    this.isLoading = true;
    if (this.selectedFiles.C && this.selectedFiles.H) {
      const formData = new FormData();
      formData.append('C', this.selectedFiles.C);
      formData.append('H', this.selectedFiles.H);
      formData.append('mf', this.MolecularFormula.get('mf')?.value);
      formData.append('name', "test");
      formData.append('id_trail', this.generateRandomNumber());

      this.http.post(`${this.apiUrlV2}/upload`, formData)
        .subscribe(
          (response: any) => {
            console.log('Upload successful', response);

            // Traitez les données reçues et mettez à jour les variables
            this.updateVariablesFromResponse(response.result);
          },
          error => {
            console.error('Upload failed', error);
            // Handle error response
          },
          () => {
            // Indique que le chargement est terminé, que ce soit en cas de succès ou d'erreur
            this.isLoading = false; // Masquer le loader
          }
        );
    } else {
      this.isLoading = false; // Masquer le loader si les fichiers ne sont pas sélectionnés
    }
  }
  generateRandomNumber(): string {
    const randomNumber = Math.floor(Math.random() * (1 - 100000 + 1)) + 1;
    return randomNumber.toString();
  }

  updateVariablesFromResponse(result: any): void {
    if (result) {
      // Mettre à jour les listes d'atomes et de corrélations
      this.atomsList = result.atoms.map((atom: any) => {
        const atomDetails: any = {
          index: atom.index,
          symbol: atom.symbol,
          valency: atom.valency,
          multiplicity: atom.multiplicity,
          hybridization: atom.hybridization,
          nmr_shift: atom.nmr_shift
        };
        // Ajouter multiplicity_suggestions seulement si multiplicity est null
        if (atom.multiplicity === null) {
          atomDetails.multiplicity_suggestions = this.getMultiplicitySuggestions(atom.multiplicity_suggestion);
        }
        return atomDetails;
      });


      // Mettre à jour la liste des hydrogènes
      this.hydrogens = result.hydrogen.map((hydrogen: any) => ({
        integral: hydrogen.integral,
        shift: hydrogen.shift
      }));

      // Log des listes pour débogage
      console.log('Liste des hydrogènes:', this.hydrogens);

      this.correlationsList = result.correlations.map((correlation: any) => ({
        atom1_index: correlation.atom1,
        atom2_index: correlation.atom2,
        correlation_type: correlation.correlationType,
        atom2_suggestion: correlation.atom2_suggestion
      }));
      // Mettre à jour les suggestions
      this.updateSuggestionsFromResponse(result);
      // Log des listes pour débogage
      console.log('Liste des atomes:', this.atomsList);
      console.log('Liste des corrélations:', this.correlationsList);
      console.log('Liste des multiplicity Suggestions:', this.multiplicitySuggestions);
      console.log('Liste des Atom2 Suggestions:', this.atom2Suggestions);

      // Mettre à jour les contrôles du formulaire
      if (this.MolecularFormula) {
        this.MolecularFormula.patchValue({
          mf: result.molecularFormula // Supposant que result contient la formule moléculaire
        });
      }

      if (this.AtomsDetails) {
        const atomControls = this.AtomsDetails.get('atomControls') as FormArray;
        atomControls.clear(); // Effacer les contrôles existants

        this.atomsList.forEach(atom => {
          atomControls.push(this.formBuilder.group({
            mult: [atom.multiplicity],
            hyb: [atom.hybridization],
            nmr_shift: [atom.nmr_shift],
            multiplicity_suggestions: [atom.multiplicity_suggestions]
          }));
        });
      }

      if (this.AtomsCorrelations) {
        const correlationsControls = this.AtomsCorrelations.get('correlationsControls') as FormArray;
        correlationsControls.clear(); // Effacer les contrôles existants

        this.correlationsList.forEach(correlation => {
          correlationsControls.push(this.formBuilder.group({
            atom1_index: [correlation.atom1_index],
            atom2_index: [correlation.atom2_index],
            correlation_type: [correlation.correlation_type],
            atom2_suggestion: [correlation.atom2_suggestion]
          }));
        });
      }
    }
  }
  updateSuggestionsFromResponse(result: any): void {
    console.log('Raw result:', result); // Affichez la réponse brute
    if (result && result.atoms && result.correlations) {
      this.multiplicitySuggestions = result.atoms
        .filter((atom: any) => atom.multiplicity_suggestion) // Filter atoms that have suggestions
        .map((atom: any) => atom.multiplicity_suggestion);
      this.atom2Suggestions = result.correlations
        .filter((correlations: any) => correlations.atom2_suggestion) // Filter atoms that have suggestions
        .map((correlations: any) => correlations.atom2_suggestion);
      console.log('Multiplicity Suggestions:', this.multiplicitySuggestions);
      console.log('Atom2 Suggestions:', this.atom2Suggestions);
    }
  }

  getMultiplicitySuggestions(multiplicitySuggestion: string | null): string {
    // Return the suggestion message as is
    return multiplicitySuggestion || 'No multiplicity suggestion available.';
  }
// Ajoutez cette méthode à votre service
  getMultiplicitySuggestionForAtom(index: number): string {
    const atom = this.atomsList.find(atom => atom.index === index);
    return atom?.multiplicity_suggestions ;
  }
  isLoggedIn(): boolean {
    // Implémentez la logique pour vérifier si l'utilisateur est connecté
    // Cela peut impliquer de vérifier un token dans le localStorage, un cookie, ou une variable d'état globale
    return !!localStorage.getItem('token'); // Par exemple, vérifiez un token dans le localStorage
  }
  idUser():number{
    const  idUser = localStorage.getItem('userId');
    return Number(idUser)
  }
  SaveTrial(): void {
    console.log("from local storage",localStorage.getItem('fullmolecul'))

    if (this.isLoggedIn()) {
      this.saveMolecule(this.idUser()).subscribe({
        next: () => {
          // Naviguer après avoir terminé tous les appels
          this.router.navigate(['/trial']);
          //this.toastr.success('Login successfully');
        },
        error: (err) => {
          console.error('Error saving molecule:', err);
          // Gérez l'erreur ici si nécessaire
        }
      });

    } else {
      // Si l'utilisateur n'est pas connecté, naviguez vers la page de connexion
      this.router.navigate(['/login']);
    }
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
      return this.http.post<any>(`${this.apiUrlV2}/saveMolecule/${id}`, moleculeRequestBody, { headers })
        .pipe(
          concatMap((response: any) => {
            const moleculeId = response.idMolecule;
            console.log('Molecule ID:', moleculeId);

            // Assurez-vous que saveAtoms retourne un Observable
            return this.saveAtoms(moleculeId).pipe(
              concatMap(() => this.saveCorrilation(moleculeId))
            );
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
      return this.http.post<any>(`${this.apiUrlV2}/saveAtoms/${moleculeId}`, requestBody);
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
      return this.http.post<any>(`${this.apiUrlV2}/saveCorrilation/${moleculeId}`, dataToSend, { headers });
    } else {
      console.error('No correlations found in localStorage.');
      return of(null); // Retourner un Observable vide si aucune donnée
    }
  }
  getUserMolecules(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlV2}/GetUserMolecules/${this.idUser()}`);
  }
  getUserTrials(): void {
    this.getUserMolecules().subscribe(
      (data: any) => {
        this.userMolecules = data; // Traitez les données reçues ici
        console.log('User molecules:', this.userMolecules);
      },
      (error: any) => {
        console.error('Error fetching user molecules:', error);
        // Gérez les erreurs ici
      }
    );
  }
  retrial(): void {
    if (this.userMolecules && this.userMolecules.length > 0) {
      this.userMolecules.forEach((result: any) => {
        // Mettre à jour les listes d'atomes et de corrélations pour chaque molécule
        const atomsList = result.atoms.map((atom: { index: number, symbol: string, valency: number, multiplicity: string | null, hybridization: string | null, nmr_shift: number | null }) => {
          const atomDetails = {
            index: atom.index,
            symbol: atom.symbol,
            valency: atom.valency,
            multiplicity: atom.multiplicity,
            hybridization: atom.hybridization,
            nmr_shift: atom.nmr_shift
          };

          return atomDetails;
        });

        const correlationsList = result.corrilation.map((correlation: { atomSet1: number, atomSet2: number, correlationType: string }) => ({
          atom1_index: correlation.atomSet1,
          atom2_index: correlation.atomSet2,
          correlation_type: correlation.correlationType
        }));

        // Log des listes pour débogage
        console.log('Liste des atomes NEW:', atomsList);
        console.log('Liste des corrélations NEW:', correlationsList);

        // Mettre à jour les contrôles du formulaire
        if (this.MolecularFormula) {
          this.MolecularFormula.patchValue({
            mf: result.chimicalformula // Supposant que result contient la formule moléculaire
          });
        }

        if (this.AtomsDetails) {
          const atomControls = this.AtomsDetails.get('atomControls') as FormArray;
          atomControls.clear(); // Effacer les contrôles existants
          console.log('hiii',atomControls);
          atomsList.forEach((atom: any) => {

            atomControls.push(this.formBuilder.group({
              mult: [atom.multiplicity],
              hyb: [atom.hybridization],
              nmr_shift: [atom.nmr_shift]
            }));

          });
          console.log('hiii2',atomControls);
        }

        if (this.AtomsCorrelations) {
          const correlationsControls = this.AtomsCorrelations.get('correlationsControls') as FormArray;
          correlationsControls.clear(); // Effacer les contrôles existants

          correlationsList.forEach((correlation: any) => {
            correlationsControls.push(this.formBuilder.group({
              atom1_index: [correlation.atom1_index],
              atom2_index: [correlation.atom2_index],
              correlation_type: [correlation.correlation_type]
            }));
          });
        }
      });
    }
  }

  executeRetrialAndNavigate(): void {
    this.retrial(); // Exécute la fonction retrial()

    // Navigue vers la route '/case'
    this.router.navigate(['/case']);
  }
  submitOneSolutions() {
    const imposedFragments = this.getCheckboxValues(this.MoleculFragments.controls['imposed_fragments'].value);
    const forbiddenFragments = this.getCheckboxValues(this.MoleculFragments.controls['forbidden_fragments'].value);

    const fragments = {
      forbiddenFragments: forbiddenFragments,
      imposedFragments: imposedFragments,
    };

    // Transformez correlationsList en la structure souhaitée
    const atomSet1: number[] = [];
    const atomSet2: number[] = [];
    const correlationTypes: string[] = [];

    this.correlationsList.forEach((correlationGroup: Correlation[]) => {
      correlationGroup.forEach((correlation: Correlation) => {
        if (correlation.atom1_index != null) {
          atomSet1.push(correlation.atom1_index);
        }
        if (correlation.atom2_index != null) {
          atomSet2.push(correlation.atom2_index);
        }
        if (correlation.correlation_type != null) {
          correlationTypes.push(correlation.correlation_type);
        }
      });
    });

    // Pour chaque type de corrélation unique, associez un tableau d'atomSet1 et atomSet2
    const uniqueCorrelationTypes = [...new Set(correlationTypes)];

    const correlationObject = uniqueCorrelationTypes.map(correlationType => ({
      atomSet1: atomSet1.filter((_, index) => correlationTypes[index] === correlationType),
      atomSet2: atomSet2.filter((_, index) => correlationTypes[index] === correlationType),
      correlationType
    }));

    const formData = {
      name: "buttan", // Example name
      mf: this.MolecularFormula.get('mf')?.value,
      desc: 'Your description here', // Adjust as needed
      atoms: this.atomsList.map((atom: any) => ({
        index: atom.index,
        symbol: atom.symbol,
        valence: atom.valency,
        multiplicity: atom.mult,
        hybridization: atom.hyb,
        nmrShift: atom.nmr_shift
      })),
      forbiddenFragments: fragments.forbiddenFragments,
      imposedFragments: fragments.imposedFragments,
      correlations: correlationObject
    };
    // Save atomsList to localStorage
    localStorage.setItem('fullmolecul', JSON.stringify(formData));
    //localStorage.setItem('newTrial',"true");

    this.http.post<Matrice>(`${this.apiUrlV2}/submitOneSolutions`, formData)
      .subscribe((response: Matrice) => {
        console.log('All solutions submitted:', response, 'your data', formData);
        this.adjacencyMatrices = response.data; // Utiliser la propriété 'data' de la réponse
        console.log('adjacencyMatrices', this.adjacencyMatrices);
        // Redirection vers /result après succès
        this.router.navigate(['/result']);
      }, error => {
        console.error('Error submitting all solutions:', error, 'your data', formData);
      });
  }
  deleteMolecule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlV2}/deleteById/${id}`);
  }
  deleteTrailById(id: number): void {
    this.deleteMolecule(id).subscribe({
      next: () => {
        console.log(`Molecule with id ${id} deleted successfully.`);
        // Vous pouvez ajouter ici une logique pour mettre à jour l'interface utilisateur
        window.location.reload()
      },
      error: (err) => {
        console.error('Error deleting molecule:', err);
        // Gérer les erreurs ici
      }
    });
  }

  getUsers(): Observable<any> {
    return this.http.get<any>('http://localhost:8088/api/v1/admin/users/get-all');
  }
  getAdminUsers(): void {
    this.getUsers().subscribe(
      (data: any) => {
        this.AdminUsers = data; // Traitez les données reçues ici
        console.log('Admin Users:', this.AdminUsers);
      },
      (error: any) => {
        console.error('Error fetching Admin Users:', error);
        // Gérez les erreurs ici
      }
    );
  }
  // Fonction pour activer un utilisateur
  activateUser(userId: number): Observable<string> {
    return this.http.put<string>(`http://localhost:8088/api/v1/admin/users/${userId}/activate`, {});
  }

  // Fonction pour désactiver un utilisateur
  deactivateUser(userId: number): Observable<string> {
    return this.http.put<string>(`http://localhost:8088/api/v1/admin/users/${userId}/deactivate`, {});
  }



}

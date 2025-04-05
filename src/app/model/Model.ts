import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class Model {

  constructor(private http: HttpClient) {}

  postData(apiUrl: string, data: any) {
    return this.http.post(apiUrl, data);
  }
  getData(apiUrl: string) {
    return this.http.get(apiUrl);
  }
  valences: { [symbol: string]: number } = {
    H: 1,
    He: 0,
    Li: 1,
    Be: 2,
    B: 3,
    C: 4,
    N: 3, //5,
    O: 2,
    F: 1,
    Ne: 0,
    Na: 1,
    Mg: 2,
    Al: 3,
    Si: 4,
    P: 3, //5,
    S: 2, //4, 6,
    Cl: 1, //3, 5, 7,
    Ar: 0,
    K: 1,
    Ca: 2,
    Sc: 3,
    Ti: 2, //4,
    V: 2, //3, 4, 5,
    Cr: 2, //3, 6,
    Mn: 2, //4, 7,
    Fe: 2, //3,
    Co: 2, //3,
    Ni: 2,
    Cu: 1, //2,
    Zn: 2,
    Ga: 3,
    Ge: 2, //4,
    As: 3, //5,
    Se: 2, //4, 6,
    Br: 1, //3, 5, 7,
    Kr: 0,
    Rb: 1,
    Sr: 2,
    Y: 3,
    Zr: 4,
    Nb: 3, //5,
    Mo: 6,
    Tc: 4, //7,
    Ru: 2, //3, 4,
    Rh: 3,
    Pd: 2, //4,
    Ag: 1,
    Cd: 2,
    In: 3,
    Sn: 2, //4,
    Sb: 3, //5,
    Te: 2, //4, 6,
    I: 1, //3, 5, 7,
    Xe: 0,
    Cs: 1,
    Ba: 2,
    La: 3,
    Ce: 3, //4,
    Pr: 3, //4,
    Nd: 3,
    Pm: 3,
    Sm: 2, //3,
    Eu: 2, //3,
    Gd: 3,
    Tb: 3, //4,
    Dy: 3,
    Ho: 3,
    Er: 3,
    Tm: 3,
    Yb: 2, //3,
    Lu: 3,
    Hf: 4,
    Ta: 5,
    W: 6,
    Re: 4, //7,
    Os: 2, //3, 4, 8
    Ir: 3, //4, 6
    Pt: 2, //4
    Au: 1, //3
    Hg: 1, //2
    Tl: 1, //3
    Pb: 2, //4
    Bi: 3, //5
    Po: 2, // 4
    At: 1, //3, 5, 7
    Rn: 0,
    Fr: 1,
    Ra: 2,
    Ac: 3,
    Th: 4,
    Pa: 5,
    U: 4, //6
    Np: 3, //4, 5, 6, 7
    Pu: 3, //4, 5, 6
    Am: 2, //3, 4, 5, 6
    Cm: 3, //4
    Bk: 3, //4
    Cf: 3, //4
    Es: 3,
    Fm: 3,
    Md: 2, //3
    No: 2,
    Lr: 3,
    Rf: 4,
    Db: 5,
    Sg: 6,
    Bh: 7,
    Hs: 8,
  };
  symbolColors: { [key: string]: string } = {
    // La palette de couleurs est la même que celle que vous avez fournie
    H: '#FFFFFF', // Blanc pour l'hydrogène
    He: '#FFC0CB', // Rose pour l'hélium
    Li: '#D3D3D3', // Gris clair pour le lithium
    Be: '#808080', // Gris pour le béryllium
    B: '#FFB6C1', // Rose clair pour le bore
    C: '#000000', // Noir pour le carbone
    N: '#ADD8E6', // Bleu clair pour l'azote
    O: '#FF0000', // Rouge pour l'oxygène
    F: '#FFD700', // Doré pour le fluor
    Ne: '#FFA500', // Orange pour le néon
    Na: '#8A2BE2', // Violet pour le sodium
    Mg: '#A9A9A9', // Gris foncé pour le magnésium
    Al: '#B0E0E6', // Bleu pâle pour l'aluminium
    Si: '#A52A2A', // Marron pour le silicium
    P: '#FFFF00', // Jaune pour le phosphore
    S: '#FFFF00', // Jaune pour le soufre
    Cl: '#00FF00', // Vert pour le chlore
    Ar: '#66CDAA', // Aqua pour l'argon
    K: '#FF6347', // Tomate pour le potassium
    Ca: '#FF4500', // Orange rouge pour le calcium
    Sc: '#1E90FF', // Bleu dodger pour le scandium
    Ti: '#D2691E', // Chocolat pour le titane
    V: '#32CD32', // Vert lime pour le vanadium
    Cr: '#32CD32', // Vert lime pour le chrome
    Mn: '#FF00FF', // Magenta pour le manganèse
    Fe: '#B22222', // Rouge brique pour le fer
    Co: '#0000CD', // Bleu moyen pour le cobalt
    Ni: '#006400', // Vert foncé pour le nickel
    Cu: '#B87333', // Cuivré pour le cuivre
    Zn: '#FFFFE0', // Jaune clair pour le zinc
    Ga: '#FFD700', // Doré pour le gallium
    Ge: '#F5DEB3', // Blé pour le germanium
    As: '#800080', // Pourpre pour l'arsenic
    Se: '#FF6347', // Tomate pour le sélénium
    Br: '#8B0000', // Rouge sombre pour le brome
    Kr: '#D3D3D3', // Gris clair pour le krypton
    Rb: '#FF4500', // Orange rouge pour le rubidium
    Sr: '#87CEEB', // Bleu ciel pour le strontium
    Y: '#1E90FF', // Bleu dodger pour l'yttrium
    Zr: '#FF00FF', // Magenta pour le zirconium
    Nb: '#1E90FF', // Bleu dodger pour le niobium
    Mo: '#C71585', // Rouge moyen pour le molybdène
    Tc: '#C71585', // Rouge moyen pour le technétium
    Ru: '#6495ED', // Bleu cornflower pour le ruthénium
    Rh: '#A52A2A', // Marron pour le rhodium
    Pd: '#A52A2A', // Marron pour le palladium
    Ag: '#C0C0C0', // Argent pour l'argent
    Cd: '#C71585', // Rouge moyen pour le cadmium
    In: '#FFB6C1', // Rose clair pour l'indium
    Sn: '#FAFAD2', // Blé pour l'étain
    Sb: '#FF4500', // Orange rouge pour l'antimoine
    Te: '#DAA520', // Jaune doré pour le tellure
    I: '#00008B', // Bleu foncé pour l'iode
    Xe: '#E0FFFF', // Bleu turquoise pour le xénon
    Cs: '#FF8C00', // Orange foncé pour le césium
    Ba: '#6A5ACD', // Bleu ardoise pour le baryum
    La: '#00FF00', // Vert pour le lanthane
    Ce: '#00FF00', // Vert pour le cérium
    Pr: '#32CD32', // Vert lime pour le praséodyme
    Nd: '#32CD32', // Vert lime pour le néodyme
    Pm: '#32CD32', // Vert lime pour le prométhium
    Sm: '#FF00FF', // Magenta pour le samarium
    Eu: '#FF00FF', // Magenta pour l'europium
    Gd: '#1E90FF', // Bleu dodger pour le gadolinium
    Tb: '#32CD32', // Vert lime pour le terbium
    Dy: '#32CD32', // Vert lime pour le dysprosium
    Ho: '#32CD32', // Vert lime pour l'holmium
    Er: '#32CD32', // Vert lime pour l'erbium
    Tm: '#32CD32', // Vert lime pour le thulium
    Yb: '#00FF00', // Vert pour l'ytterbium
    Lu: '#00FF00', // Vert pour le lutécium
    Hf: '#FF00FF', // Magenta pour l'hafnium
    Ta: '#C71585', // Rouge moyen pour le tantale
    W: '#C71585', // Rouge moyen pour le tungstène
    Re: '#C71585', // Rouge moyen pour le rhénium
    Os: '#6495ED', // Bleu cornflower pour l'osmium
    Ir: '#A52A2A', // Marron pour l'iridium
    Pt: '#C0C0C0', // Argent pour le platine
    Au: '#FFD700', // Doré pour l'or
    Hg: '#00FFFF', // Cyan pour le mercure
    Tl: '#FF4500', // Orange rouge pour le thallium
    Pb: '#00008B', // Bleu foncé pour le plomb
    Bi: '#800080', // Pourpre pour le bismuth
    Po: '#C71585', // Rouge moyen pour le polonium
    At: '#800080', // Pourpre pour l'astate
    Rn: '#8A2BE2', // Violet pour le radon
    Fr: '#8A2BE2', // Violet pour le francium
    Ra: '#6A5ACD', // Bleu ardoise pour le radium
    Ac: '#FF4500', // Orange rouge pour l'actinium
    Th: '#00008B', // Bleu foncé pour le thorium
    Pa: '#6495ED', // Bleu cornflower pour le protactinium
    U: '#FFD700', // Doré pour l'uranium
    Np: '#FF00FF', // Magenta pour le neptunium
    Pu: '#FF00FF', // Magenta pour le plutonium
    Am: '#FF00FF', // Magenta pour l'américium
    Cm: '#FF00FF', // Magenta pour le curium
    Bk: '#FF00FF', // Magenta pour le berkélium
    Cf: '#FF00FF', // Magenta pour le californium
    Es: '#FF00FF', // Magenta pour l'einsteinium
    Fm: '#FF00FF', // Magenta pour le fermium
    Md: '#FF00FF', // Magenta pour le mendélévium
    No: '#FF00FF', // Magenta pour le nobélium
    Lr: '#FF00FF', // Magenta pour le lawrencium
    Rf: '#FF00FF', // Magenta pour le rutherfordium
    Db: '#FF00FF', // Magenta pour le dubnium
    Sg: '#FF00FF', // Magenta pour le seaborgium
    Bh: '#FF00FF', // Magenta pour le bohrium
    Hs: '#FF00FF', // Magenta pour le hassium
  };
}

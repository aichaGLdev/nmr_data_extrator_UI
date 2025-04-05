import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import { MatDialogRef } from "@angular/material/dialog";
import { PyService } from "../service/py.service";

cytoscape.use(fcose);

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() adjacencyMatrices: number[][][] = [];
  @ViewChild('cyContainer', { static: false }) cyContainer!: ElementRef;
  private cy: any;

  constructor(
    public service: PyService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.visualizeGraphs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['adjacencyMatrices'] && !changes['adjacencyMatrices'].firstChange) {
      this.visualizeGraphs();
    }
  }

  visualizeGraphs(): void {
    if (!this.cyContainer) {
      console.error('cyContainer is undefined');
      return;
    }

    if (this.cy) {
      this.cy.destroy();
    }

    const atoms = this.service.atomsList || [];
    console.log('atoms from chart ', atoms);

    this.adjacencyMatrices.forEach((matrix) => {
      const elements = this.convertMatrixToGraph(matrix, atoms);

      this.cy = cytoscape({
        container: this.cyContainer.nativeElement,
        elements: elements,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': 'data(nodeColor)', // Utiliser data pour la couleur dynamique
              'label': 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 'data(width)',
              'line-color': 'data(lineColor)',
              'target-arrow-color': 'data(lineColor)',
              'target-arrow-shape': 'triangle'
            }
          }
        ],
        layout: {
          name: 'fcose'
        }
      });
    });
  }

  convertMatrixToGraph(matrix: number[][], atoms: { index: number, symbol: string }[]): any[] {
    const elements: any[] = [];

    // Créez une carte pour accéder facilement aux symboles des atomes
    const atomMap = new Map<number, string>();
    atoms.forEach(atom => {
      atomMap.set(atom.index - 1, atom.symbol);
    });

    // Fonction pour obtenir la couleur du nœud en fonction du symbole
    const getNodeColor = (symbol: string) => {
      switch (symbol) {
        case 'C': return '#ff9999'; // Exemple couleur pour le carbone
        case 'O': return '#99ccff'; // Exemple couleur pour l'oxygène
        // Ajoutez d'autres cas pour d'autres symboles
        default: return '#666'; // Couleur par défaut pour les autres atomes
      }
    };

    // Ajouter les nœuds avec une couleur basée sur le symbole
    for (let i = 0; i < matrix.length; i++) {
      const symbol = atomMap.get(i) || `Node ${i}`;
      elements.push({
        data: { id: `n${i}`, label: symbol, nodeColor: getNodeColor(symbol) }
      });
    }

    // Fonction pour obtenir la couleur en fonction de la valeur
    const getColor = (value: number) => {
      if (value === 1) return '#ccc';
      if (value === 2) return '#999'; // Un peu plus foncé que '#ccc'
      if (value === 3) return '#666'; // Encore plus foncé
      return '#000'; // Noir par défaut pour les autres valeurs
    };

    // Fonction pour obtenir la largeur en fonction de la valeur
    const getWidth = (value: number) => {
      if (value === 1) return 3;
      if (value === 2) return 5;
      if (value === 3) return 7;
      return 1; // Largeur par défaut pour les autres valeurs
    };

    // Ajouter les arêtes avec des styles dynamiques
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        const value = matrix[i][j];
        if (value > 0) {
          elements.push({
            data: {
              source: `n${i}`,
              target: `n${j}`,
              width: getWidth(value),
              lineColor: getColor(value)
            }
          });
        }
      }
    }

    return elements;
  }
}

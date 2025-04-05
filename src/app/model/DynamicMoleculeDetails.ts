export interface DynamicMoleculeDetails{
  index: number;
  symbol: string;
  valence: number;
  multiplicity: number | null;
  hybridization: number | null;
  nmr_shift: number | null;
  multiplicity_suggestion:any;
}

export interface RequiredField {
  name: string;
  description: string;
}

export interface Dor {
  required_fields: RequiredField[];
}

export interface CategoryDOR {
  name: string;
  dor: Dor;
}

export interface Dors {
  categories: CategoryDOR[];
}

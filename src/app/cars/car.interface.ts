export enum Color {
  Black = "black",
  White = "white",
  Silver = "silver",
  Gray = "gray",
  Red = "red",
  Blue = "blue",
  Green = "green",
  Yellow = "yellow",
  Orange = "orange",
  Brown = "brown",
  Beige = "beige",
  Gold = "gold",
  Purple = "purple",
  Pink = "pink",
  Teal = "teal",
}

export enum Make {
  Opel = "Opel",
  Ford = "Ford",
  BMW = "BMW",
  Audi = "Audi",
  Toyota = "Toyota",
  Honda = "Honda",
  Chevrolet = "Chevrolet",
  Nissan = "Nissan",
  Volkswagen = "Volkswagen",
  Mercedes = "Mercedes",
  Hyundai = "Hyundai",
  Kia = "Kia",
  Subaru = "Subaru",
  Mazda = "Mazda",
  Lexus = "Lexus",
}

export const modelsByMake = {
  [Make.Opel]: ["Astra", "Corsa", "Insignia", "Mokka"],
  [Make.Ford]: ["Focus", "Fiesta", "Mustang", "Explorer"],
  [Make.BMW]: ["3 Series", "5 Series", "X3", "X5"],
  [Make.Audi]: ["A3", "A4", "A6", "Q5"],
  [Make.Toyota]: ["Corolla", "Camry", "Yaris", "RAV4"],
  [Make.Honda]: ["Civic", "Accord", "CR-V", "Jazz"],
  [Make.Chevrolet]: ["Malibu", "Cruze", "Impala", "Tahoe"],
  [Make.Nissan]: ["Micra", "Sentra", "Altima", "Qashqai"],
  [Make.Volkswagen]: ["Golf", "Passat", "Polo", "Tiguan"],
  [Make.Mercedes]: ["A-Class", "C-Class", "E-Class", "GLC"],
  [Make.Hyundai]: ["i10", "i20", "Elantra", "Tucson"],
  [Make.Kia]: ["Rio", "Ceed", "Sportage", "Sorento"],
  [Make.Subaru]: ["Impreza", "Legacy", "Forester", "Outback"],
  [Make.Mazda]: ["Mazda2", "Mazda3", "Mazda6", "CX-5"],
  [Make.Lexus]: ["IS", "ES", "RX", "NX"],
} as const satisfies Record<Make, readonly string[]>;

export const isModelValidForMake = (make: Make, model: string): boolean =>
  (modelsByMake[make] as readonly string[]).includes(model);

export interface Car {
  _id?: string;          
  make: Make;
  model: string;
  color: Color;
  yearOfCar?: number | null;
  year?: number | null;
}

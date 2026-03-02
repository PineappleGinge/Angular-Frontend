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

export interface Car {
  _id?: string;          
  make: Make;
  model: string;
  color: Color;
  yearOfCar?: number | null;
  year?: number | null;
}

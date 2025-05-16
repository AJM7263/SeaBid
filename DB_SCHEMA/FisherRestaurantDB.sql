CREATE DATABASE FisherRestaurantDB;
USE FisherRestaurantDB;

CREATE TABLE Fisher (
    FisherID INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    NumeroTelefono VARCHAR(20),
    Localizacion VARCHAR(255),
    Email VARCHAR(100) UNIQUE
);

CREATE TABLE Restaurant (
    RestaurantID INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    NumeroTelefono VARCHAR(20),
    Localizacion VARCHAR(255),
    Email VARCHAR(100) UNIQUE
);

CREATE TABLE Product (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    TipoDePescado VARCHAR(100) NOT NULL,
    Precio DECIMAL(10,2) NOT NULL,
    Imagen VARCHAR(255),
    Descripcion TEXT,
    Fecha DATE NOT NULL,
    Peso DECIMAL(10,2) NOT NULL,
    OrderID INT, -- Assuming this is a reference to an order table
    FisherID INT,
    RestaurantID INT,
    FOREIGN KEY (FisherID) REFERENCES Fisher(FisherID),
    FOREIGN KEY (RestaurantID) REFERENCES Restaurant(RestaurantID)
);
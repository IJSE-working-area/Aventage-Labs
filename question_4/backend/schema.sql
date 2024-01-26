
CREATE TABLE Restaurants (
                             id INT PRIMARY KEY AUTO_INCREMENT,
                             title VARCHAR(255) NOT NULL
);


CREATE TABLE Items (
                       id INT PRIMARY KEY AUTO_INCREMENT,
                       title VARCHAR(255) NOT NULL,
                       price DECIMAL(10, 2) NOT NULL,
                       restaurant_id INT,
                       FOREIGN KEY (restaurant_id) REFERENCES Restaurants(id)
);

CREATE TABLE Invoices (
                          id INT PRIMARY KEY AUTO_INCREMENT,
                          total DECIMAL(10, 2) NOT NULL
);

CREATE TABLE Orders (
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        invoice_id INT,
                        restaurant_id INT,
                        item_id INT,
                        quantity INT NOT NULL ,
                        FOREIGN KEY (invoice_id) REFERENCES Invoices(id),
                        FOREIGN KEY (restaurant_id)REFERENCES Restaurants(id),
                        FOREIGN KEY (item_id)REFERENCES Items(id)

);



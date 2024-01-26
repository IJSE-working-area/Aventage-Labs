CREATE TABLE Menu (
                      ItemID INT PRIMARY KEY AUTO_INCREMENT,
                      Category VARCHAR(255),
                      ItemName VARCHAR(255),
                      ItemPrice DECIMAL(10, 2)
);
CREATE TABLE `Order` (
                         OrderID INT PRIMARY KEY AUTO_INCREMENT,
                         CustomerName VARCHAR(255),
                         OrderDate VARCHAR(255)
);
CREATE TABLE OrderItem (
                           OrderItemID INT PRIMARY KEY AUTO_INCREMENT,
                           OrderID INT,
                           ItemID INT,
                           FOREIGN KEY (OrderID) REFERENCES `Order`(OrderID),
                           FOREIGN KEY (ItemID) REFERENCES Menu(ItemID)
);



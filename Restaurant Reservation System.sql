-- Restaurant Reservation System --
-----------------------------------
-- Syed Muhammad Ali (24L-0893)  --
-- Abdul Muhaymin Ans (24L-0514) --
--   Muhammad Saad (24L-0962)    --





-- Database Schema --
CREATE TABLE Customer (
    CustomerID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Phone VARCHAR(15),
    Email VARCHAR(100)
);


CREATE TABLE TableZone (
    ZoneID INT PRIMARY KEY,
    ZoneName VARCHAR(50) NOT NULL,
    SurchargeAmount DECIMAL(10, 2) DEFAULT 0.00
);


CREATE TABLE RestaurantTable (
    TableID INT PRIMARY KEY,
    ZoneID INT,
    Capacity INT NOT NULL,
    Status VARCHAR(20) DEFAULT 'Available',
    CONSTRAINT FK_Zone FOREIGN KEY (ZoneID) 
        REFERENCES TableZone(ZoneID) 
        ON DELETE SET NULL
);


CREATE TABLE Reservation (
    ResID INT PRIMARY KEY,
    CustomerID INT,
    TableID INT,
    ReservationDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    ReservationStatus VARCHAR(20) DEFAULT 'Pending',
    PreOrderState VARCHAR(20) DEFAULT 'None',
    CONSTRAINT FK_Customer FOREIGN KEY (CustomerID) 
        REFERENCES Customer(CustomerID) 
        ON DELETE CASCADE,
    CONSTRAINT FK_Table FOREIGN KEY (TableID) 
        REFERENCES RestaurantTable(TableID) 
        ON DELETE CASCADE,
    CONSTRAINT CHK_Status CHECK (ReservationStatus IN ('Pending', 'Confirmed', 'Denied', 'Cancelled'))
);


CREATE TABLE Menu (
    ItemID INT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    Category VARCHAR(50)
);


CREATE TABLE OrderDetail (
    OrderID INT PRIMARY KEY,
    ResID INT,
    ItemID INT,
    Quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT FK_Reservation FOREIGN KEY (ResID) 
        REFERENCES Reservation(ResID) 
        ON DELETE CASCADE,
    CONSTRAINT FK_Menu FOREIGN KEY (ItemID) 
        REFERENCES Menu(ItemID) 
        ON DELETE CASCADE
);





-- Database Population --
INSERT INTO Customer (CustomerID, Name, Phone, Email) VALUES
(101, 'Ahmed Raza', '03211234567', 'ahmed.raza@gmail.com'),
(102, 'Fatima Tariq', '03339876543', 'fatima.t@yahoo.com'),
(103, 'Usman Bilal', '03005554443', 'usman.b@gmail.com'),
(104, 'Ayesha Khan', '03451112233', 'ayesha.k@hotmail.com');

INSERT INTO TableZone (ZoneID, ZoneName, SurchargeAmount) VALUES
(1, 'Main Dining', 0.00),
(2, 'Patio', 5.00),
(3, 'VIP Lounge', 20.00),
(4, 'Rooftop', 15.00);

INSERT INTO RestaurantTable (TableID, ZoneID, Capacity, Status) VALUES
(1, 1, 4, 'Available'),
(2, 1, 2, 'Available'),
(3, 2, 6, 'Reserved'),
(4, 3, 8, 'Available'),
(5, 2, 4, 'Maintenance');

INSERT INTO Menu (ItemID, Name, Price, Category) VALUES
(1, 'Margherita Pizza', 12.50, 'Pizza'),
(2, 'Diet Soda', 2.00, 'Beverage'),
(3, 'Wagyu Steak', 85.00, 'Main Course'),
(4, 'Pumpkin Soup', 8.50, 'Seasonal'),
(5, 'Garlic Bread', 5.00, 'Appetizer'),
(6, 'Truffle Fries', 10.00, 'Side');

INSERT INTO Reservation (ResID, CustomerID, TableID, ReservationDate, StartTime, EndTime, ReservationStatus, PreOrderState) VALUES
(101, 101, 1, '2026-03-30', '18:00', '19:00', 'Pending', 'Placed'),
(102, 101, 2, '2026-03-31', '19:00', '20:00', 'Confirmed', 'Placed'),
(103, 101, 1, '2026-04-01', '20:00', '21:00', 'Confirmed', 'Placed'),
(104, 101, 3, '2026-04-02', '18:30', '20:30', 'Confirmed', 'Placed'),
(105, 102, 4, '2026-04-03', '19:00', '21:00', 'Confirmed', 'Placed'),
(106, 103, 2, '2026-04-04', '20:00', '21:30', 'Confirmed', 'None');

INSERT INTO OrderDetail (OrderID, ResID, ItemID, Quantity) VALUES
(1, 101, 4, 2),
(2, 102, 3, 1),
(3, 103, 5, 3),
(4, 104, 1, 2),
(5, 105, 1, 1),
(6, 105, 2, 2);





-- 15 Functionalities
-- 1.
INSERT INTO Customer (CustomerID, Name, Phone, Email)
VALUES (1, 'Muhammad Ali', '03001234567', 'ali@dinesync.com');

-- 2.
UPDATE Reservation
SET ReservationStatus = 'Confirmed'
WHERE ResID = 101;

-- 3.
DELETE FROM Menu
WHERE Category = 'Seasonal';

-- 4.
SELECT CustomerID, Name, Phone 
FROM Customer
WHERE Phone LIKE '%4443'
ORDER BY Name ASC;

-- 5.
SELECT od.ResID, SUM(m.Price * od.Quantity) AS TotalBill
FROM OrderDetail od
JOIN Menu m ON od.ItemID = m.ItemID
GROUP BY od.ResID;

-- 6.
SELECT CustomerID, COUNT(ResID) AS TotalReservations
FROM Reservation
GROUP BY CustomerID
HAVING COUNT(ResID) > 3;

-- 7.
SELECT TableID, ZoneID, Capacity, Status
FROM RestaurantTable
WHERE Capacity = (
    SELECT MAX(Capacity) 
    FROM RestaurantTable
);

-- 8.
SELECT t.TableID, t.Capacity, r.ReservationDate, r.StartTime
FROM RestaurantTable t
LEFT JOIN Reservation r ON t.TableID = r.TableID;

-- 9.
SELECT rt.TableID, rt.Status, tz.ZoneName
FROM RestaurantTable rt
RIGHT JOIN TableZone tz ON rt.ZoneID = tz.ZoneID;

-- 10.
SELECT m.Name, od.OrderID, od.Quantity
FROM Menu m
FULL OUTER JOIN OrderDetail od ON m.ItemID = od.ItemID;

-- 11.
SELECT Name AS SearchResult, 'Customer' AS Type 
FROM Customer
UNION
SELECT Name AS SearchResult, 'Menu Item' AS Type 
FROM Menu;

-- 12.
SELECT r.CustomerID 
FROM Reservation r 
JOIN OrderDetail od ON r.ResID = od.ResID 
WHERE od.ItemID = 1
INTERSECT
SELECT r.CustomerID 
FROM Reservation r 
JOIN OrderDetail od ON r.ResID = od.ResID 
WHERE od.ItemID = 2;

-- 13.
SELECT CustomerID 
FROM Reservation
EXCEPT
SELECT r.CustomerID 
FROM Reservation r 
JOIN OrderDetail od ON r.ResID = od.ResID;

-- 14.
SELECT Name, Price, Category 
FROM Menu 
WHERE Price > (
    SELECT AVG(Price) 
    FROM Menu
);

-- 15.
SELECT c.Name, r.TableID, tz.ZoneName, r.StartTime, r.EndTime
FROM Reservation r
JOIN Customer c ON r.CustomerID = c.CustomerID
JOIN RestaurantTable rt ON r.TableID = rt.TableID
JOIN TableZone tz ON rt.ZoneID = tz.ZoneID
WHERE r.ReservationStatus = 'Confirmed'
ORDER BY r.StartTime ASC;
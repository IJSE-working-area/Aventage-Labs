import './NewOrder.css';
import React, { useState, useEffect } from "react";
import Navigation from "../../components/Navigation/Navigation";
import axios from "axios";

export default function Home() {

    const [mainDishes, setMainDishes] = useState([]);
    const [sideDishes, setSideDishes] = useState([]);
    const [desserts, setDesserts] = useState([]);
    const [CustomerName, setCustomerName] = useState("");

    const [selectedMainDishes, setSelectedMainDishes] = useState([]);
    const [selectedSideDishes, setSelectedSideDishes] = useState([]);
    const [selectedDesserts, setSelectedDesserts] = useState([]);

    const fetchMainDishes = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/getMainDishes`);
            if (response.data === null) {
                alert('Error getting main dishes');

            } else {
                setMainDishes(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchSideDishes = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/getsidedishes`);
            if (response.data === null) {
                alert('Error getting side dishes');
            } else {
                setSideDishes(response.data);

            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchDesserts = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/getdesserts`);
            if (response.data === null) {
                alert('Error getting desserts');
            } else {
                setDesserts(response.data);

            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchMainDishes();
        fetchSideDishes();
        fetchDesserts();
    }, []);

    const saveOrder = (event) => {
        event.preventDefault();
        if (selectedMainDishes.length===0){
            alert("must order a main dish");
            return;
        }

        if (selectedSideDishes.length===0){
            alert("must order a one or more side dishes");
            return;
        }


        // Combine all selected items into a single array
        const selectedItems = [...selectedMainDishes, ...selectedSideDishes, ...selectedDesserts];

        const order = {
            CustomerName,
            OrderDate: new Date().toLocaleDateString().toString(),
            selectedItems,
        };

        axios.post(`${process.env.REACT_APP_API_URL}`, order)
            .then(response => {

                alert(`Successfully ordered ${response.data}`);
                setCustomerName('');
                setSelectedMainDishes([]);
                setSelectedSideDishes([]);
                setSelectedDesserts([]);
                document.getElementById("mainDish").selectedIndex = -1;
                document.getElementById("sideDishes").selectedIndex = -1;
                document.getElementById("desserts").selectedIndex = -1;

            })
            .catch(error => {
                console.error(error);
            });

    };

    return (
        <div className='container-fluid'>
            <div className='row'>
                <header className="d-flex justify-content-between align-items-center p-3 bg-dark text-white">
                    <h1 className='text-white'>Colombo resturent</h1>
                
                </header>
                <Navigation/>
                <div className='col-md-10' id='conainercontain'>
                    <div className='container'>

                        <form>
                            <label htmlFor="customerName">Customer name</label>
                            <input
                                id="customerName"
                                type="text"
                                value={CustomerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                required
                            />

                            <label htmlFor="mainDish">Select main dish</label>
                            <select name="mainDish" id="mainDish" multiple required onChange={(e) => setSelectedMainDishes(Array.from(e.target.selectedOptions, option => option.value))}>
                                {mainDishes.map((dish, index) => (
                                    <option key={index} value={dish.ItemID}>{dish.ItemID}   {dish.ItemName}     Rs{dish.ItemPrice}/=</option>
                                ))}
                            </select>

                            <label htmlFor="sideDishes">Select side dishes</label>
                            <select name="sideDishes" id="sideDishes" multiple required onChange={(e) => setSelectedSideDishes(Array.from(e.target.selectedOptions, option => option.value))}>
                                {sideDishes.map((dish, index) => (
                                    <option key={index} value={dish.ItemID}>{dish.ItemID}   {dish.ItemName}     Rs{dish.ItemPrice}/=</option>
                                ))}
                            </select>

                            <label htmlFor="desserts">Select desserts</label>
                            <select name="desserts" id="desserts" multiple onChange={(e) => setSelectedDesserts(Array.from(e.target.selectedOptions, option => option.value))}>
                                {desserts.map((dessert, index) => (
                                    <option key={index} value={dessert.ItemID}>{dessert.ItemID}   {dessert.ItemName}     Rs{dessert.ItemPrice}/=</option>
                                ))}
                            </select>

                            <button type="button" onClick={saveOrder}>Order</button>
                        </form>

                    </div>
                </div>
            </div>

          
           


        </div>
    );
}

import './Reports.css';
import React, {useState, useEffect} from "react";
import Navigation from "../../components/Navigation/Navigation";
import axios from "axios";

export default function Home() {

    const [dailySalesRevenue, setDailySalesRevenue] = useState(0);
    const [mostFamousMainDish, setMostFamousMainDish] = useState("");
    const [mostFamousSideDish, setMostFamousSideDish] = useState("");
    const [mostOccurances, setmostOccurances] = useState([]);

    const getDailySalesRevenue = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/getDailySalesRevenue`);
            if (response.data === null) {
                alert('Error getting daily sales revenue');
            } else {
                setDailySalesRevenue(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getMostFamousMainDish = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/getMostFamousMainDish`);
            if (response.data === null) {
                alert('Error getting most famous main dish');
            } else {
                setMostFamousMainDish(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getMostFamousSideDish = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/getMostFamousSideDish`);
            if (response.data === null) {
                alert('Error getting most famous side dish');
            } else {
                setMostFamousSideDish(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const mostConsumeDishVsMainDish = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/mostConsumeDishVsMainDish`);
            if (response.data === null) {
                alert('Error');
            } else {
                setmostOccurances(response.data);

            }
        } catch (error) {
            console.log(error);
        }
    };


    useEffect(() => {
        getDailySalesRevenue();
        getMostFamousMainDish();
        getMostFamousSideDish();
        mostConsumeDishVsMainDish();

    }, []);


    return (
        <div className='container-fluid'>
            <div className='row'>
                <header className="d-flex justify-content-between align-items-center p-3 bg-dark text-white">
                    <h1 className='text-white'>Colombo resturent</h1>

                </header>
                <Navigation/>
                <div className='col-md-10' id='conainercontain'>
                    <div className='container'>
                        <label htmlFor="dailySalesRevenue">Daily sales revenue</label>
                        <input
                            id="dailySalesRevenue"
                            type="number"
                            value={dailySalesRevenue.toFixed(2)}
                            readOnly
                        />

                        <label htmlFor="mostFamousMainDish">Most famous main dish</label>
                        <input
                            id="mostFamousMainDish"
                            type="text"
                            value={mostFamousMainDish}
                            readOnly
                        />

                        <label htmlFor="mostFamousSideDish">Most famous side dish</label>
                        <input
                            id="mostFamousSideDish"
                            type="text"
                            value={mostFamousSideDish}
                            readOnly
                        />

                        <table className="table">
                            <thead>
                            <tr>
                                <th>Main Dish</th>
                                <th>Most Consumed Side Dish</th>
                            </tr>
                            </thead>
                            <tbody>
                            {mostOccurances.map((dish, index) => (
                                <tr key={index}>
                                    <td>{dish.MainDish}</td>
                                    <td>{dish.MostConsumedSideDish}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>


                    </div>
                </div>
            </div>


        </div>
    );
}

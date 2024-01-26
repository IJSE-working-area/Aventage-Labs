import React, {useEffect, useState} from 'react';
import './Home.css';
import Navigation from "../../components/Navigation/Navigation";
import axios from "axios";


export default function Home() {
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);
    const fetchItems = async (id) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/items`);

            if (response.data === null) {
                alert('Error getting items');
            } else {
                setItems(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    };


    useEffect(() => {
        fetchItems();

    }, []);


    const handleSelect = (item) => {
        setSelectedItems([...selectedItems, item]);
        setQuantities({...quantities, [item.id]: 1}); // Default quantity is set to 1
    };

    const handleQuantityChange = (itemId, quantity) => {
        setQuantities({...quantities, [itemId]: quantity});
    };

    useEffect(() => {

        const calculatedTotalPrice = selectedItems.reduce(
            (total, selectedItem) => total + selectedItem.price * quantities[selectedItem.id],
            0
        );
        setTotalPrice(calculatedTotalPrice);
    }, [selectedItems, quantities]);

    const handleOrder = async () => {
        try {

            const orderData = {
                selectedItems,
                quantities,
                totalPrice,
            };
                console.log(orderData)

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/order`, orderData);
            console.log(response.data);
            setSelectedItems([]);
            setQuantities({});
            setTotalPrice(0);
        } catch (error) {
            console.error('Error placing order:', error);
        }
    };

    return (
        <div className='container-fluid'>
            <div className='row'>
                <header className="d-flex justify-content-between align-items-center p-3 bg-dark text-white">
                    <h1 className='text-white'>Food Ordering system</h1>
                </header>
                <Navigation/>
                <div className='col-md-10' id='conainercontain'>
                    <div className='container'>

                        <h4>Select items</h4>
                        <br/>
                        <div id="items">
                            {items.map((item, index) => (
                                <div key={index} id="selectItems">
                                    <h4>{item.id} {item.title} Rs{item.price}/= {item.restaurant_title}</h4>
                                    <button onClick={() => handleSelect(item)}>Select</button>
                                </div>
                            ))}
                        </div>

                        <br/>
                        <h4>Selected items</h4>
                        <table className="table">
                            <thead>
                            <tr>
                                <th>Item Id</th>
                                <th>Item Name</th>
                                <th>Unit Price</th>
                                <th>quantity</th>
                            </tr>
                            </thead>
                            <tbody>
                            {selectedItems.map((selectedItem, index) => (
                                <tr key={index}>
                                    <td>{selectedItem.id}</td>
                                    <td>{selectedItem.title}</td>
                                    <td>Rs {selectedItem.price}/=</td>
                                    <td>
                                        <input
                                            type="number"
                                            value={quantities[selectedItem.id] || 0}
                                            onChange={(e) => handleQuantityChange(selectedItem.id, parseInt(e.target.value, 10))}
                                        />
                                    </td>

                                </tr>
                            ))}
                            </tbody>
                            <tfoot>
                            <tr>
                            <td colSpan={3}>Total</td>
                            <td>Rs{totalPrice}/=</td>
                            </tr>
                            </tfoot>

                        </table>
                        <button onClick={handleOrder}>Order</button>

                    </div>
                </div>
            </div>


        </div>
    );
}



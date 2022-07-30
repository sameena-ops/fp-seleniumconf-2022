import { expectedDeliveryCharges } from "../businessLayer/businessRule.js";

const cartCalculations = async (cartItems) =>{

 function getExpectedTotalPrice(typeOfDelivery) {
    const itemTotal = parseFloat(expectedItemTotalPrice(cartItems));
    const deliveryCharges = parseFloat(expectedDeliveryCharges(typeOfDelivery));
    const totalCartPrice = (itemTotal + deliveryCharges).toFixed(2);
    console.log(`Total expected cart price calculated is :`, totalCartPrice);

    return (totalCartPrice);
}

 function expectedItemTotalPrice() {

    var total = cartItems.reduce((acc , item) => (acc + parseFloat(item.price) ),0);
    console.log(`Total item charges calculated is :`, total);
    return total.toFixed(2);
}
return {
    getExpectedTotalPrice,
    expectedItemTotalPrice
};

}

export default cartCalculations;





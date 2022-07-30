const url = "http://localhost:3000/#/";
const username = "user1@gmail.com";
const password = "password@1";
const addressName = 'SelConf22';
const deliveryTypes = ['Standard Delivery', 'Fast Delivery', 'One Day Delivery'];
const deliveryType = deliveryTypes[0];
const orderConfirmationMeesage = 'Thank you for your purchase!';
const TIMEOUT = 3000;

const data = {
    url,username,password,addressName,deliveryType,orderConfirmationMeesage,TIMEOUT
}


export default data;
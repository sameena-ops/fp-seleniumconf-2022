import pkg from 'selenium-webdriver';
const { Builder, By, Key, WebElement, locateWith, until, timeouts, promise } = pkg;
import cartActionsMethods from '../src/cartOperations/cartActions.js';
import userActionsMethods from '../src/userOperations/userActions.js';
import itemActionsMethods from '../src/itemOperations/itemActions.js';
import data from '../utility/data.js';
import * as itemCalculations from '../src/itemOperations/itemCalculations.js';
import cartCalculations from '../src/cartOperations/cartCalculations.js';
import * as rules from '../src/businessLayer/businessRule.js';
import assert from 'assert';

describe('Juice shop tests', function () {

    it.only('should be able to order required juices and validate the price of the order', async function () {

        let driver = await new Builder().forBrowser("chrome").build();
        await driver.manage().setTimeouts({ implicit: data.TIMEOUT, pageLoad: data.TIMEOUT, script: data.TIMEOUT });

        const cartActions = await cartActionsMethods(driver);
        const userActions = await userActionsMethods(driver);
        const itemActions = await itemActionsMethods(driver);

        await userActions.launchApplication(data.url);
        await userActions.login(data.username, data.password);


        let juicePrices = await itemActions.getAllItems();
        //const favJuices = await filterItems(juicePrices,'price','0.99');
        const favJuices = await itemCalculations.filterItems(juicePrices, 'name', 'ml');

        console.log(favJuices);
        await cartActions.selectItemsAndCheckout(favJuices);

        await userActions.selectAddress(data.addressName);
        await userActions.selectDelivery(data.deliveryType);
        await userActions.selectCardAndContinue();

        const cart = await cartCalculations(favJuices);

        const expectedTotalPrice = cart.getExpectedTotalPrice(data.deliveryType);
        const expectedItemTotalPrice = cart.expectedItemTotalPrice();
        const expectedBonusPoints = rules.expectedBonusPoints(expectedTotalPrice);
        const expectedDeliveryCharges = rules.expectedDeliveryCharges(data.deliveryType);

        const actualTotalPrice = await cartActions.totalCartPriceDisplayed();
        const actualItemCharges = await cartActions.totalItemChargesDisplayed();
        const actualBonusPoints = await cartActions.getBonusPointsDisplayed();
        const actualDeliveryCharges = await cartActions.totalDeliveryChargesDisplayed();


        assert.equal(actualDeliveryCharges, expectedDeliveryCharges);
        assert.equal(actualItemCharges, expectedItemTotalPrice);
        assert.equal(actualTotalPrice, expectedTotalPrice);
        assert.equal(actualBonusPoints, expectedBonusPoints);


        await cartActions.placeYourOrderAndPay();
        const actualConfirmationMessage = await cartActions.getOrderConfirmation();

        assert.equal(actualConfirmationMessage, data.orderConfirmationMeesage);


        await driver.close();
        await driver.quit();

    })
});









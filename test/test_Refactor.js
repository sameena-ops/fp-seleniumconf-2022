import pkg from 'selenium-webdriver';
const { Builder, By, Key, WebElement, locateWith, until, timeouts, promise } = pkg;
import assert from 'assert';
import * as R from 'ramda';
//Underscore, Lodash

//describe('Juice shop tests', function () {

    //it.only('should be able to order required juices and validate the price of the order', async function () {

    async function test() {

        let driver = await new Builder().forBrowser("chrome").build();
        const url = "http://localhost:3000/#/";
        const username = "user1@gmail.com";
        const password = "password@1";
        const addressName = 'SelConf22';
        const deliveryType = ['Standard Delivery', 'Fast Delivery', 'One Day Delivery'];
        const orderConfirmationMeesage = 'Thank you for your purchase!';
        const TIMEOUT = 3000;
        await driver.manage().setTimeouts({ implicit: TIMEOUT, pageLoad: TIMEOUT, script: TIMEOUT });
        await launchApplication(url, driver);
        await login(username, password, driver);
        var juicePrices = await getAllItems(driver);

        const favJuices = await getJuiceTypeItems(juicePrices,returnItemsWhichAreJuices);

        await addJuicesToCart(favJuices, driver);
        await navigateToCart(driver);
        await checkoutCart(driver);
        await selectAddress(addressName, driver);
        await selectDelivery(deliveryType[0], driver);
        await selectCardAndContinue(driver);

        var expectedTotalPrice = getExpectedTotalPrice(favJuices, deliveryType[0]);
        var actualTotalPrice = await totalCartPriceDisplayed(driver);
        var actualDeliveryCharges = await totalDeliveryChargesDisplayed(driver);
        var actualItemCharges = await totalItemChargesDisplayed(driver);
        var actualBonusPoints = await getBonusPointsDisplayed(driver);
        assert.equal(actualDeliveryCharges, expectedDeliveryCharges(deliveryType[0]));
        assert.equal(actualItemCharges, expectedItemTotalPrice(favJuices));
        assert.equal(actualTotalPrice, expectedTotalPrice);
        assert.equal(actualBonusPoints, expectedBonusPoints(expectedTotalPrice));
        await placeYourOrderAndPay(driver);
        var actualConfirmationMessage = await getOrderConfirmation(driver);
        assert.equal(actualConfirmationMessage, orderConfirmationMeesage);
        await driver.close();
        await driver.quit();
    }
    test();




function getJuiceTypeItems(juices, f) {
    return f(juices)
}

function returnItemsWhichAreJuices(items)
{
    return items.filter(item => {
        return item.name.includes('ml');
      });
}

function returnItemsGreaterThanThousand(items)
{
    return items.filter(item => {
        return (parseInt(item.price)>=999);
      });
}


async function launchApplication(url, driver) {

    await driver.get("http://localhost:3000/#/");
    await driver.manage().window().maximize();
    await closeWelcomeMessages(driver);
}


async function login(username, password, driver) {
    await driver.findElement(By.id("navbarAccount")).click();
    await driver.findElement(By.id("navbarLoginButton")).click();
    await driver.findElement(By.id("email")).sendKeys(username);
    await driver.findElement(By.id("password")).sendKeys(password);
    await driver.findElement(By.id("loginButton")).click();
}

async function closeWelcomeMessages(driver) {
    await driver.findElement(By.xpath("//*[@aria-label='Close Welcome Banner']")).click();
    await driver.findElement(By.xpath("//a[text()='Me want it!']")).click();
}


async function clearBasket(driver) {
    var itemsInBasket = await driver.findElement(By.xpath("//*[@aria-label='Show the shopping cart']/span[1]/span[2]")).getText();

    if (parseInt(itemsInBasket, 10) > 0) {
        await driver.findElement(By.xpath("//*[@aria-label='Show the shopping cart']")).click();

        await driver.sleep(2000);

        for (var i = 0; i < itemsInBasket; i++) {
            await driver.sleep(2000);
            driver.findElement(By.xpath("//*[@data-icon='trash-alt']")).click();
        }

        driver.findElement(By.xpath("//*[@aria-label='Back to homepage']")).click();
    }
}




async function navigateToCart(driver) {
    await driver.findElement(By.xpath("//*[@aria-label='Show the shopping cart']")).click();
    const trashIcon = driver.findElement(By.xpath("//*[@aria-label='Show the shopping cart']"));
    driver.wait(until.elementIsVisible(trashIcon), 10000);
}


async function checkoutCart(driver) {
    var checkoutBtn = await driver.findElement(By.id("checkoutButton"));
    await driver.executeScript("arguments[0].scrollIntoView(true);", checkoutBtn);
    await driver.wait(until.elementIsVisible(driver.findElement(By.id("checkoutButton"))), 10000);
    await driver.wait(until.elementIsNotVisible(driver.findElement(By.className("cdk-overlay-container bluegrey-lightgreen-theme"))), 10000);
    await checkoutBtn.click();
}

async function totalCartPriceDisplayed(driver) {
    await driver.wait(until.elementIsVisible(driver.findElement(By.xpath('//span[contains(text(), "Phone Number")]'))), 10000);
    let totalPrice = await (await driver.findElement(By.className('mat-footer-cell price'))).getText();
    totalPrice = totalPrice.replace('¤', '');
    console.log(`Total cart price displayed is :`, totalPrice);
    return totalPrice;
}

async function totalDeliveryChargesDisplayed(driver) {
    let deliveryCharges = await (await driver.findElement(By.xpath('//*[contains(text(), "Delivery")]/following-sibling::td')).getText());

    deliveryCharges = deliveryCharges.replace('¤', '');
    console.log(`Applicable delivery charges displayed is :`, deliveryCharges);
    return deliveryCharges;
}

async function totalItemChargesDisplayed(driver) {
    let itemCharges = await (await driver.findElement(By.xpath('//*[contains(text(), "Items")]/following-sibling::td')).getText());

    itemCharges = itemCharges.replace('¤', '');
    console.log(`Item total charges displayed is :`, itemCharges);
    return itemCharges;
}

function expectedItemTotalPrice(items) {

    var total = items.reduce((acc , item) => (acc + parseFloat(item.price) ),0);
    console.log(`Total item charges calculated is :`, total);
    return total.toFixed(2);
}

const expectedDeliveryCharges = R.cond([
        [R.equals('Fast Delivery'), R.always('0.50')],
        [R.equals('One Day Delivery'), R.always('0.99')],
        [R.equals('Standard Delivery'), R.always('0.00')],
        [R.T,           temp => '0.00']
      ]);


function expectedBonusPoints(totalPrice) {
    const bonusPoints = parseInt(((totalPrice + 1) / 1000) * 100);
    console.log(`Total bonus points calculated is :`, bonusPoints);
    return bonusPoints;
}

function getExpectedTotalPrice(items, typeOfDelivery) {
    const itemTotal = parseFloat(expectedItemTotalPrice(items));
    const deliveryCharges = parseFloat(expectedDeliveryCharges(typeOfDelivery));
    const totalCartPrice = (itemTotal + deliveryCharges).toFixed(2);
    console.log(`Total expected cart price calculated is :`, totalCartPrice);

    return (totalCartPrice);
}



async function selectAddress(addressName, driver) {
    let addrName = await driver.findElement(By.xpath(`//mat-cell[contains(text(), ${addressName})]`));
    addrName.click();
    await driver.findElement(By.xpath("//span[contains(text(), 'Continue')]")).click();
    console.log(`Address - ${addressName} has been selected`);
}

async function selectDelivery(deliveryType, driver) {
    await driver.findElement(By.xpath(`//mat-cell[contains(text(), "${deliveryType}")]`)).click();
    await driver.findElement(By.xpath("//span[contains(text(), 'Continue')]")).click();
    console.log(`Delivery speed - ${deliveryType} has been selected`);

}

async function selectCardAndContinue(driver) {
    await driver.findElement(By.xpath("//mat-radio-button")).click();
    await driver.findElement(By.xpath("//span[contains(text(), 'Continue')]")).click();
    console.log("Saved card has been selected");
    await driver.wait(until.elementIsVisible(driver.findElement(By.className('mat-table cdk-table'))), 10000);
}

async function placeYourOrderAndPay(driver) {
    await driver.findElement(By.xpath("//span[contains(text(), 'Place your order and pay')]")).click();
    console.log("Order has been places");
}

function mapRelevantValues(array)
{
   const juiceProperties =  array.reverse();
   return {
    "name" :juiceProperties[2],
    "price":juiceProperties[1].replace('¤','')
   }
}


async function getAllItems(driver) {  
    const juices = await driver.findElements(By.xpath("//*[@class='mat-grid-tile ng-star-inserted']"));
    
    const mapOfJuiceNameAndPrices = await Promise.all(juices.map( element => element.getText()));
    const functions = R.pipe(R.split('\n'),mapRelevantValues);
    var itemMappedToTheirPrices = (R.map(functions,mapOfJuiceNameAndPrices));
    console.log(itemMappedToTheirPrices);
    return itemMappedToTheirPrices;
}


/* async function addJuicesToCart(juices, driver) {
    for (var i = 0; i < juices.length; i++) {
        let juiceElement = await driver.findElement(By.xpath(`//*[contains(text(), '${juices[i].name}')]`));
        let basket = await driver.findElement(locateWith(By.tagName('button')).below(juiceElement));
        await driver.executeScript("arguments[0].scrollIntoView(true);", basket);
        await basket.click();
    }
} */

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

 async function addJuicesToCart(juices, driver) {

    const juicesCopy = juices.slice();
    const juiceNames = R.pluck(('name'), juicesCopy);
    console.log(juiceNames);

  await asyncForEach(juiceNames , async name=> {
        let juiceElement = await driver.findElement(By.xpath(`//*[contains(text(), '${name}')]`));
        console.log(name)
        let basket =  await driver.findElement(locateWith(By.tagName('button')).below(juiceElement));
        await driver.executeScript("arguments[0].scrollIntoView(true);", basket);
        await basket.click();
    });


} 

const addItemToBasket = async (driver) => async (name) => {
    let juiceElement = await driver.findElement(By.xpath(`//*[contains(text(), '${name}')]`));
    let basket = await driver.findElement(locateWith(By.tagName('button')).below(juiceElement));
    await driver.executeScript("arguments[0].scrollIntoView(true);", basket);
    await basket.click();
}

async function getOrderConfirmation(driver) {
    return (await driver.findElement(By.className("confirmation")).getText());
}

async function getBonusPointsDisplayed(driver) {
    var a = await driver.findElement(By.className("bonus-points"));
    var bonusPointsText = await a.getText();

    var bonusPoints = bonusPointsText.match(/(\d+)/)[0];
    return parseInt(bonusPoints);

}


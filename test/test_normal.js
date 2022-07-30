import pkg from 'selenium-webdriver';
const { Builder, By, Key, WebElement, locateWith, until, timeouts, promise } = pkg;
import assert from 'assert';

describe('Juice shop tests', function () {

    it('should be able to order required juices and validate the price of the order', async function () {

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
        let juicePrices = await getAllItems(driver);

        const favJuices = await getJuiceTypeItems(juicePrices, 'juice only');

        await addJuicesToCart(favJuices, driver);
        await navigateToCart(driver);
        await checkoutCart(driver);
        await selectAddress(addressName, driver);
        await selectDelivery(deliveryType[0], driver);
        await selectCardAndContinue(driver);

        let expectedTotalPrice = getExpectedTotalPrice(favJuices, deliveryType[0]);
        let actualTotalPrice = await totalCartPriceDisplayed(driver);
        let actualDeliveryCharges = await totalDeliveryChargesDisplayed(driver);
        let actualItemCharges = await totalItemChargesDisplayed(driver);
        let actualBonusPoints = await getBonusPointsDisplayed(driver);
        assert.equal(actualDeliveryCharges, expectedDeliveryCharges(deliveryType[0]));
        assert.equal(actualItemCharges, expectedItemTotalPrice(favJuices));
        assert.equal(actualTotalPrice, expectedTotalPrice);
        assert.equal(actualBonusPoints, expectedBonusPoints(expectedTotalPrice));
        await placeYourOrderAndPay(driver);
        let actualConfirmationMessage = await getOrderConfirmation(driver);
        assert.equal(actualConfirmationMessage, orderConfirmationMeesage);
        await driver.close();
        await driver.quit();
    });
});



async function getFavoriteJuicesBasedOnJuiceType(juices) {
    let favJuices = [];
    for (let i = 0; i < juices.length; i++) {
        if (juices[i].name.includes('ml'))
            favJuices.push(juices[i]);

    }
    console.log(favJuices);
    return favJuices;
}

async function getFavoriteJuicesBasedOnPrice(juices) {
    let favJuices = [];
    for (let i = 0; i < juices.length; i++) {
        if (praseInt(juices[i].price) >= 999)
            favJuices.push(juices[i]);

    }
    return favJuices;
}

async function getJuiceTypeItems(juices, string) {
    let favItems = [];
    if (string === 'juice only') {
        favItems = getFavoriteJuicesBasedOnJuiceType(juices);
    }
    else if (string == 'high price') {
        favItems = getFavoriteJuicesBasedOnPrice(juices);
    }
    return favItems;
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



async function navigateToCart(driver) {
    await driver.findElement(By.xpath("//*[@aria-label='Show the shopping cart']")).click();
    const trashIcon = driver.findElement(By.xpath("//*[@aria-label='Show the shopping cart']"));
    driver.wait(until.elementIsVisible(trashIcon), 10000);
}

async function navigateToTotalPrice(driver) {
    let checkoutBtn = await driver.findElement(By.id("checkoutButton"));
    await driver.executeScript("arguments[0].scrollIntoView(true);", checkoutBtn);
}

async function checkoutCart(driver) {
    let checkoutBtn = await driver.findElement(By.id("checkoutButton"));
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
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        let price = parseFloat(items[i].price);
        total = total + price;
    }
    console.log(`Total item charges calculated is :`, total);
    return total.toFixed(2);
}

function expectedDeliveryCharges(typeOfDelivery) {
    if (typeOfDelivery === 'Standard Delivery')
        return '0.00';
    else if (typeOfDelivery === 'Fast Delivery')
        return '0.50';
    else if (typeOfDelivery === 'One Day Delivery')
        return '0.99';
}

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

async function getAllItems(driver) {

    const juices = await driver.findElements(By.xpath("//*[@class='mat-grid-tile ng-star-inserted']"));
    const mapOfJuiceNameAndPrices = [];

    for (let i = 0; i < juices.length; i++) {
        let elementText = await juices[i].getText();
        let allValuesOfElement = elementText.split('\n');
        if (allValuesOfElement[3] === undefined) {
            mapOfJuiceNameAndPrices.push({
                "name": allValuesOfElement[0],
                "price": allValuesOfElement[1].replace('¤', '')
            })
        }
        else {
            if (!(allValuesOfElement[0]).includes("Sold")) {
                mapOfJuiceNameAndPrices.push({
                    "name": allValuesOfElement[1],
                    "price": allValuesOfElement[2].replace('¤', '')
                })
            }
        }
    }
    console.log(mapOfJuiceNameAndPrices);
    return mapOfJuiceNameAndPrices;
}

async function addJuicesToCart(juices, driver) {
    for (let i = 0; i < juices.length; i++) {
        let juiceElement = await driver.findElement(By.xpath(`//*[contains(text(), '${juices[i].name}')]`));
        let basket = await driver.findElement(locateWith(By.tagName('button')).below(juiceElement));
        await driver.executeScript("arguments[0].scrollIntoView(true);", basket);
        await basket.click();
    }
}

async function getOrderConfirmation(driver) {
    return (await driver.findElement(By.className("confirmation")).getText());
}

async function getBonusPointsDisplayed(driver) {
    let a = await driver.findElement(By.className("bonus-points"));
    let bonusPointsText = await a.getText();

    let bonusPoints = bonusPointsText.match(/(\d+)/)[0];
    return parseInt(bonusPoints);

}


//require('chromedriver');
const { Builder, By, Key, WebElement, withTagName, locateWith, until, elementIsVisible } = require("selenium-webdriver");
async function test() {

    let driver = await new Builder().forBrowser("chrome").build();
    const url = "http://localhost:3000/#/";
    const username = "nam@gmail.com";
    const password = "password@1";
    const addressName = 'NamHouse';
    const deliveryType = 'Standard Delivery';

    await launchApplication(url, driver);
    await closeWelcomeMessages(driver);
    await login(username, password, driver);
    await driver.sleep(2000);
    await clearBasket(driver);
    await driver.sleep(2000);
    var juicePrices = await getAllJuicesWithPrices(driver);
    console.log(juicePrices);
    const favJuices = juicePrices.filter(getFavoriteJuices)
    console.log(favJuices);
    await driver.sleep(2000);
    (favJuices.map(async ele => {

        await clickAddToBasket(ele, driver);

    }))
    await driver.sleep(3000);
    await navigateToShoppingCart(driver);
    await navigateToTotalPrice(driver);
    var expectedTotalPrice = await calcExpectedTotalPrice(favJuices);
    var totalPriceDisplayed =  await checkTotalCartAmount(driver);
    console.log(totalPriceDisplayed);
    totalPriceDisplayed = parseFloat(totalPriceDisplayed);
    if ((expectedTotalPrice - totalPriceDisplayed) >= 0.02)
        console.log(`${totalPriceDisplayed} price is not matching ${expectedTotalPrice}`);
    else
        console.log(`${totalPriceDisplayed} price is matching ${expectedTotalPrice}`);

    await checkoutCart(driver);
    await driver.sleep(4000);

    await selectAddress(addressName, driver);
    await selectDelivery(deliveryType, driver);

    await payAndContinue(driver);

    var confirmation = (await driver.findElement(By.className("confirmation")).getText());
    console.log(confirmation);

}
//test()


async function getFavoriteJuices(ele) {
    if (ele.name.includes('Juice'))
        return ele;

}

async function clickAddToBasket(elem, driver) {
    let juiceElement = await driver.findElement(By.xpath(`//*[contains(text(), '${elem.name}')]`));
    let basket = await driver.findElement(locateWith(By.tagName('button')).below(juiceElement));


    driver.executeScript("arguments[0].scrollIntoView(true);", basket);
    await driver.sleep(1000);

    await basket.click();
}

var add = function (a, b) {
    return a + b;
};

async function launchApplication(url, driver) {

    await driver.get("http://localhost:3000/#/");
    await driver.manage().window().maximize();
}


async function getAllItems(driver) {
    const R = require('ramda');

    const juices = await driver.findElements(By.xpath("//*[@class='mat-grid-tile ng-star-inserted']"));
    const pathComponents = R.split('\n');
    var values = await Promise.all(juices.map(juice => (juice.getText())));
    console.log(values);
    const final = values.map(value => pathComponents(value))
    const juicePrices = [];
    final.map(value => {
        if (value[3] === undefined) {

            juicePrices.push({
                "name": value[0],
                "price": value[1].replace('¤', '')
            })

        }
        else {
            if (!(value[0]).includes("Sold")) {
                juicePrices.push({
                    "name": value[1],
                    "price": value[2].replace('¤', '')
                })
            }
        }
    })

}


async function closeWelcomeMessages(driver) {
    await driver.findElement(By.xpath("//*[@aria-label='Close Welcome Banner']")).click();
    await driver.findElement(By.xpath("//a[text()='Me want it!']")).click();
}


async function login(username, password, driver) {

    await driver.findElement(By.id("navbarAccount")).click();
    await driver.findElement(By.id("navbarLoginButton")).click();
    await driver.findElement(By.id("email")).sendKeys(username);
    await driver.findElement(By.id("password")).sendKeys(password);
    await driver.findElement(By.id("loginButton")).click();
}

async function clickById(array, driver)
{
    array.map(ele=>driver.click(ele));
}

async function clearBasket(driver) {
    var count = await driver.findElement(By.xpath("//*[@aria-label='Show the shopping cart']/span[1]/span[2]")).getText();

    if (parseInt(count, 10) > 0) {
        await driver.findElement(By.xpath("//*[@aria-label='Show the shopping cart']")).click();

        await driver.sleep(2000);

        for (var i = 0; i < count; i++) {
            await driver.sleep(2000);
            driver.findElement(By.xpath("//*[@data-icon='trash-alt']")).click();
        }

        driver.findElement(By.xpath("//*[@aria-label='Back to homepage']")).click();
    }
}

async function getAllJuicesWithPrices2(driver) {
    const R = require('ramda');
    const juices = await driver.findElements(By.xpath("//*[@class='mat-grid-tile ng-star-inserted']"));
    const getNames = (ele) => ele.getText();
    const pathComponents = R.split('\n');
    var values = await Promise.all(juices.map(juice => (juice.getText())));
    console.log(values);
    const final = values.map(value => pathComponents(value))
    const juicePrices = [];
    final.map(value => {
        if (value[3] === undefined) {

            juicePrices.push({
                "name": value[0],
                "price": value[1].replace('¤', '')
            })

        }
        else {
            if (!(value[0]).includes("Sold")) {
                juicePrices.push({
                    "name": value[1],
                    "price": value[2].replace('¤', '')
                })
            }
        }
    })
    return juicePrices;
}


async function navigateToShoppingCart(driver) {
    await driver.findElement(By.xpath("//*[@aria-label='Show the shopping cart']")).click();
}

async function navigateToTotalPrice(driver) {
    var checkoutBtn = await driver.findElement(By.id("checkoutButton"));
    driver.executeScript("arguments[0].scrollIntoView(true);", checkoutBtn);
}

async function checkoutCart(driver) {
    var checkoutBtn = await driver.findElement(By.id("checkoutButton"));
    driver.executeScript("arguments[0].scrollIntoView(true);", checkoutBtn);
    await driver.sleep(4000);
    await checkoutBtn.click();
}

 async function checkTotalCartAmount(driver) {
    await driver.sleep(4000);
   const totalPrice= (await driver.findElement(By.xpath("//*[@id='price']")).getText()).split(':')[1].replace('¤', '');
   return totalPrice;
}

async function calcExpectedTotalPrice(items) {
    const prices = items.map(ele => parseFloat(ele.price))
    var expectedTotalPrice = prices.reduce((ele, acc) => ele + acc)
    return expectedTotalPrice;
}

async function selectAddress(addressName, driver) {

    let addrName = await driver.findElement(By.xpath(`//mat-cell[contains(text(), ${addressName})]`));
    addrName.click();
    await driver.findElement(By.xpath("//span[contains(text(), 'Continue')]")).click();
}

async function selectDelivery(deliveryType, driver) {
    await driver.findElement(By.xpath(`//mat-cell[contains(text(), "${deliveryType}")]`)).click();
    await driver.findElement(By.xpath("//span[contains(text(), 'Continue')]")).click();
    await driver.sleep(2000);
}

async function payAndContinue(driver) {
    await driver.findElement(By.xpath("//mat-radio-button")).click();
    await driver.findElement(By.xpath("//span[contains(text(), 'Continue')]")).click();
    await driver.findElement(By.xpath("//span[contains(text(), 'Place your order and pay')]")).click();
    await driver.sleep(2000);
}


async function getAllJuicesWithPrices2(driver) {
    const juices = await driver.findElements(By.xpath("//*[@class='mat-grid-tile ng-star-inserted']"));
    const mapOfJuiceNameAndPrices = [];

    for (var i = 0; i < juices.length; i++) {
        var elementText = await juices[i].getText();
        var allValuesOfElement = elementText.split('\n');
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
    return mapOfJuiceNameAndPrices;
}


//getText = (element) =>  element.getText();
splitText = (string,keyword) => string.replace(keyword);


async function getText(element){
    return await element.getText();
}

async function splitText(text, keyword)
{
    return text.split(keyword);
}

async function extractPriceFromString(string, symbol)
{
    return string.replace(symbol,string);
}

async function mapValues(allValuesOfElement)
{
    const mapOfJuiceNameAndPrices = [];
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
    return mapOfJuiceNameAndPrices;
}

import pkg from 'selenium-webdriver';
const { Builder, By, Key, WebElement, locateWith, until, timeouts, promise } = pkg;


const cartActionMethods = async (driver) =>{

    async function addItemsToCart(juices) {

        for (var i = 0; i < juices.length; i++) {
            let juiceElement = await driver.findElement(By.xpath(`//*[contains(text(), '${juices[i].name}')]`));
            let basket = await driver.findElement(locateWith(By.tagName('button')).below(juiceElement));
            await driver.executeScript("arguments[0].scrollIntoView(true);", basket);
            await basket.click();
        }
    };
    
     async function navigateToCart() {
        await driver.findElement(By.xpath("//*[@aria-label='Show the shopping cart']")).click();
        const trashIcon = driver.findElement(By.xpath("//*[@aria-label='Show the shopping cart']"));
        driver.wait(until.elementIsVisible(trashIcon), 10000);
    }
    
    
     async function checkoutCart() {
        var checkoutBtn = await driver.findElement(By.id("checkoutButton"));
        await driver.executeScript("arguments[0].scrollIntoView(true);", checkoutBtn);
        await driver.wait(until.elementIsNotVisible(driver.findElement(By.className("cdk-overlay-container bluegrey-lightgreen-theme"))), 20000);
        await driver.wait(until.elementIsVisible(driver.findElement(By.id("checkoutButton"))), 10000);
        await checkoutBtn.click();
    }
    
     async function selectItemsAndCheckout(juices)
    {
        await addItemsToCart(juices,driver);
        await navigateToCart(driver);
        await checkoutCart(driver);
    
    }
    
     async function totalCartPriceDisplayed() {
        await driver.wait(until.elementIsVisible(driver.findElement(By.xpath('//span[contains(text(), "Phone Number")]'))), 10000);
        let totalPrice = await (await driver.findElement(By.className('mat-footer-cell price'))).getText();
        totalPrice = totalPrice.replace('¤', '');
        console.log(`Total cart price displayed is :`, totalPrice);
        return totalPrice;
    }
    
    
     async function totalDeliveryChargesDisplayed() {
        let deliveryCharges = await (await driver.findElement(By.xpath('//*[contains(text(), "Delivery")]/following-sibling::td')).getText());
    
        deliveryCharges = deliveryCharges.replace('¤', '');
        console.log(`Applicable delivery charges displayed is :`, deliveryCharges);
        return deliveryCharges;
    }
    
     async function getBonusPointsDisplayed() {
        var a = await driver.findElement(By.className("bonus-points"));
        var bonusPointsText = await a.getText();
    
        var bonusPoints = bonusPointsText.match(/(\d+)/)[0];
        return parseInt(bonusPoints);
    
    }
    
     async function totalItemChargesDisplayed() {
        let itemCharges = await (await driver.findElement(By.xpath('//*[contains(text(), "Items")]/following-sibling::td')).getText());
    
        itemCharges = itemCharges.replace('¤', '');
        console.log(`Item total charges displayed is :`, itemCharges);
        return itemCharges;
    }
    
    
     async function placeYourOrderAndPay() {
        await driver.findElement(By.xpath("//span[contains(text(), 'Place your order and pay')]")).click();
        console.log("Order has been places");
    }
    
    
     async function getOrderConfirmation() {
        return (await driver.findElement(By.className("confirmation")).getText());
    }

    return {

        selectItemsAndCheckout,
        totalCartPriceDisplayed,
        totalDeliveryChargesDisplayed,
        getBonusPointsDisplayed,
        totalItemChargesDisplayed,
        placeYourOrderAndPay,
        getOrderConfirmation

    };

};

export default cartActionMethods;

 
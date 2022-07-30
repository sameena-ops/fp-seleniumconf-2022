import pkg from 'selenium-webdriver';
const { Builder, By, Key, WebElement, locateWith, until, timeouts, promise } = pkg; 

const userActionMethods = async (driver) =>{

async function selectAddress(addressName) {
    let addrName = await driver.findElement(By.xpath(`//mat-cell[contains(text(), ${addressName})]`));
    addrName.click();
    await driver.findElement(By.xpath("//span[contains(text(), 'Continue')]")).click();
    console.log(`Address - ${addressName} has been selected`);
}

 async function selectDelivery(deliveryType) {
    await driver.findElement(By.xpath(`//mat-cell[contains(text(), "${deliveryType}")]`)).click();
    await driver.findElement(By.xpath("//span[contains(text(), 'Continue')]")).click();
    console.log(`Delivery speed - ${deliveryType} has been selected`);

}

 async function selectCardAndContinue() {
    await driver.findElement(By.xpath("//mat-radio-button")).click();
    await driver.findElement(By.xpath("//span[contains(text(), 'Continue')]")).click();
    console.log("Saved card has been selected");
    await driver.wait(until.elementIsVisible(driver.findElement(By.className('mat-table cdk-table'))), 10000);
}

async function navigateToLogin() {
    await driver.findElement(By.id("navbarAccount")).click();
    await driver.findElement(By.id("navbarLoginButton")).click();

}

 async function login(username,password) {
    await navigateToLogin( driver);
    await driver.findElement(By.id("email")).sendKeys(username);
    await driver.findElement(By.id("password")).sendKeys(password);
    await driver.findElement(By.id("loginButton")).click();
}

 async function launchApplication(url) {

    await driver.get(url);
    await driver.manage().window().maximize();
    await closeWelcomeMessages(driver);
}

async function closeWelcomeMessages(driver) {
    await driver.findElement(By.xpath("//*[@aria-label='Close Welcome Banner']")).click();
    await driver.findElement(By.xpath("//a[text()='Me want it!']")).click();
}

return {
    selectAddress,
    selectDelivery,
    selectCardAndContinue,
    login,
    launchApplication


}
};
export default userActionMethods;

import pkg from 'selenium-webdriver';
const { Builder, By, Key, WebElement, locateWith, until, timeouts, promise } = pkg;
import * as R from 'ramda';

const itemActionMethods = async (driver) =>{

function mapRelevantValues(array)
{
   const juiceProperties =  array.reverse();
   return {
    "name" :juiceProperties[2],
    "price":juiceProperties[1].replace('¤','')
   }
}

 async function getAllItems() {  
    const juices = await driver.findElements(By.xpath("//*[@class='mat-grid-tile ng-star-inserted']"));
    
    const mapOfJuiceNameAndPrices = await Promise.all(juices.map( element => element.getText()));
    const functions = R.pipe(R.split('\n'),mapRelevantValues);
    let itemMappedToTheirPrices = (R.map(functions,mapOfJuiceNameAndPrices));
    console.log(itemMappedToTheirPrices);
    return itemMappedToTheirPrices;
}
return {
    getAllItems
}
};

export default itemActionMethods;

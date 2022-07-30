import * as R from 'ramda';

export const expectedDeliveryCharges = R.cond([
    [R.equals('Fast Delivery'), R.always('0.50')],
    [R.equals('One Day Delivery'), R.always('0.99')],
    [R.equals('Standard Delivery'), R.always('0.00')],
    [R.T,           temp => '0.00']
  ]);


export function expectedBonusPoints(totalPrice) {
    const bonusPoints = parseInt(((totalPrice + 1) / 1000) * 100);
    console.log(`Total bonus points calculated is :`, bonusPoints);
    return bonusPoints;
}
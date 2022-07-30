import * as R from 'ramda';

export const filterItems = (list, property,rule) => {
    return list.filter(filtering(property)(rule));
}

 const filtering = function (property) { 
    return function (rule) 
        { 
        return function (item) { 
            let value= R.prop(property,item);
            let boolean = R.or(value.includes(rule), value>=(rule));
            return boolean;
 
 }}};



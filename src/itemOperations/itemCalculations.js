import * as R from 'ramda';

export const filterItems = (list, property,rule) => {
    return list.filter(filtering(property)(rule));
}

 const filtering = function (property) { 
    return function (rule) 
        { 
            return function (item) { 
            var value= R.prop(property,item);
            var boolean = R.or(value.includes(rule), value>=(rule));
            return boolean;
 
 }}};



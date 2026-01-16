const { validateConversion } = require('./config/conversionMatrix');

console.log("Testing PNG -> PDF:");
console.log(validateConversion('png', 'pdf'));

console.log("Testing JPG -> PDF:");
console.log(validateConversion('jpg', 'pdf'));

console.log("Testing JPEG -> PDF:");
console.log(validateConversion('jpeg', 'pdf'));

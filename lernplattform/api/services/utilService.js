exports.isDateInRange = function (range) {
    return (range.publishedFrom <= Date.now() && range.publishedUntil >= Date.now());
};
exports.cleanRange = function (range) {
    let result = {
        publishedFrom: new Date(range.publishedFrom),
        publishedUntil: new Date(range.publishedFrom)
    };
    result.publishedFrom.setMinutes(0);
    result.publishedFrom.setHours(0);
    result.publishedFrom.setSeconds(0);
    result.publishedUntil.setMinutes(23);
    result.publishedUntil.setHours(59);
    result.publishedUntil.setSeconds(59);
    return result;
};
exports.cleanString = function (str) {
    return str.replace(new RegExp(new RegExp(" "), 'g'), "");
};
exports.isDateInRange = function (range) {
    return (range.publishedFrom <= Date.now() && range.publishedUntil >= Date.now());
};
exports.cleanRange = function (range) {
    let result = {
        publishedFrom: new Date(range.publishedFrom),
        publishedUntil: new Date(range.publishedUntil)
    };
    // EndZeitpunkt auf kurz vor mitternacht
    result.publishedUntil.setHours(23);
    result.publishedUntil.setMinutes(59);
    result.publishedUntil.setSeconds(59);
    return result;
};
exports.cleanString = function (str) {
    return str.replace(new RegExp(new RegExp(" "), 'g'), "");
};
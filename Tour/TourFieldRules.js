var passenger = $PASSENGER$;
var segment = $SEGMENT$;
var messageArray = new Array();
var detectPersianLetterRegex = new RegExp("^[آ-ی' ']*$");
var detectLatinRegex = new RegExp("^[a-zA-Z' ']*$");
var detectNationalNumberRegex = new RegExp('^[0-9]{10}$');
function checkRequiredFields() {
    if (segment == 'NationalNumber') {
        checkIranian(passenger);
    } else if (segment == 'Passport') {
        checkForeign(passenger);
    }
    if (messageArray.length != 0) {
        return { type: 'COMPONENTS', labels: messageArray };
    } else {
        return null;
    }
}
function checkIranian(passenger) {
    if (!passenger['namePersian'] || !passenger['namePersian'].trim()) {
        messageArray.push({ text: 'نام فارسی اجباری است', id: 'NamePersian' });
    }
    if (!detectPersianLetterRegex.test(passenger['namePersian'])) {
        messageArray.push({ text: 'نام فارسی باید حروف فارسی باشد', id: 'NamePersian' });
    }
    if (passenger['namePersian'].length > 32) {
        messageArray.push({ text: 'نام فارسی نمیتواند بیشتر از ۳۲ کاراکتر باشد.', id: 'NamePersian' });
    }
    if (!passenger['lastNamePersian'] || !passenger['lastNamePersian'].trim()) {
        messageArray.push({ text: 'نام خانوادگی فارسی اجباری است', id: 'LastNamePersian' });
    }
    if (!detectPersianLetterRegex.test(passenger['lastNamePersian'])) {
        messageArray.push({ text: 'نام خانوادگی فارسی باید حروف فارسی باشد', id: 'LastNamePersian' });
    }
    if (passenger['lastNamePersian'].length > 32) {
        messageArray.push({ text: 'نام خانوادگی فارسی نمیتواند بیشتر از ۳۲ کاراکتر باشد.', id: 'LastNamePersian' });
    }
    if (!passenger['name'] || !passenger['name'].trim()) {
        messageArray.push({ text: 'نام لاتین اجباری است', id: 'Name' });
    }
    if (!detectLatinRegex.test(passenger['name'])) {
        messageArray.push({ text: 'نام لاتین باید حروف لاتین باشد', id: 'Name' });
    }
    if (passenger['name'].length > 32) {
        messageArray.push({ text: 'نام لاتین نمیتواند بیشتر از ۳۲ کاراکتر باشد.', id: 'Name' });
    }
    if (!passenger['lastName'] || !passenger['lastName'].trim()) {
        messageArray.push({ text: 'نام خانوادگی لاتین اجباری است', id: 'LastName' });
    }
    if (!detectLatinRegex.test(passenger['lastName'])) {
        messageArray.push({ text: 'نام خانوادگی لاتین باید حروف لاتین باشد', id: 'LastName' });
    }
    if (passenger['lastName'].length > 32) {
        messageArray.push({ text: 'نام خانوادگی لاتین نمیتواند بیشتر از ۳۲ کاراکتر باشد.', id: 'LastName' });
    }
    if (!passenger['birthDate']) {
        messageArray.push({ text: 'تاریخ تولد اجباری است', id: 'BirthDate' });
    }
    if (isInFuture(passenger['birthDate'])) {
        messageArray.push({ text: 'این تاریخ قابل انتخاب نیست', id: 'BirthDate' });
    }
    if (!passenger['gender']) {
        messageArray.push({ text: 'جنسیت اجباری است', id: 'Gender' });
    }
    var nationalNumberIdentification = findIdentification(passenger, 'NationalNumber');
    checkNationalNumberRequiredFields(nationalNumberIdentification, passenger);
}
function checkForeign(passenger) {
    if (!passenger['name'] || !passenger['name'].trim()) {
        messageArray.push({ text: 'نام لاتین اجباری است', id: 'Name' });
    }
    if (!passenger['lastName'] || !passenger['lastName'].trim()) {
        messageArray.push({ text: 'نام خانوادگی لاتین اجباری است', id: 'LastName' });
    }
    if (!detectLatinRegex.test(passenger['name'])) {
        messageArray.push({ text: 'نام لاتین باید حروف لاتین باشد', id: 'Name' });
    }
    if (passenger['name'].length > 32) {
        messageArray.push({ text: 'نام لاتین نمیتواند بیشتر از ۳۲ کاراکتر باشد.', id: 'Name' });
    }
    if (!detectLatinRegex.test(passenger['lastName'])) {
        messageArray.push({ text: 'نام خانوادگی لاتین باید حروف لاتین باشد', id: 'LastName' });
    }
    if (passenger['lastName'].length > 32) {
        messageArray.push({ text: 'نام خانوادگی لاتین نمیتواند بیشتر از ۳۲ کاراکتر باشد.', id: 'LastName' });
    }
    if (!passenger['birthDate']) {
        messageArray.push({ text: 'تاریخ تولد اجباری است', id: 'BirthDate' });
    }
    if (isInFuture(passenger['birthDate'])) {
        messageArray.push({ text: 'فرمت تاریخ تولد صحیح نیست', id: 'BirthDate' });
    }
    if (!passenger['gender']) {
        messageArray.push({ text: 'جنسیت اجباری است', id: 'Gender' });
    }
    var passportIdentification = findIdentification(passenger, 'Passport');
    checkPassportRequiredFields(passportIdentification, passenger);
}

function findIdentification(passenger, type) {
    if (passenger.identifications) {
        return passenger.identifications.find((element) => element.identificationType == type);
    } else {
        return null;
    }
}
function checkNationalNumberRequiredFields(nationalNumberIdentification) {
    if (!nationalNumberIdentification.code || !nationalNumberIdentification.code.trim()) {
        messageArray.push({ text: 'کد ملی اجباری است', id: 'NationalNumber' });
        return messageArray;
    } else if (!detectNationalNumberRegex.test(nationalNumberIdentification.code)) {
        messageArray.push({ text: 'کد ملی نامعتبر است', id: 'NationalNumber' });
        return messageArray;
    }
}
function checkPassportRequiredFields(passportIdentification, passenger) {
    if (!passportIdentification.placeOfBirth) {
        messageArray.push({ text: 'کشور محل تولد اجباری است', id: 'PlaceOfBirth' });
    }
    if (!passportIdentification.expiryDate) {
        messageArray.push({ text: 'تاریخ انقضای پاسپورت اجباری است', id: 'ExpiryDate' });
    }
    if (!isInFuture(passportIdentification.expiryDate)) {
        messageArray.push({ text: 'این تاریخ قابل انتخاب نیست', id: 'ExpiryDate' });
    }
    if (dateDiffInDays(passportIdentification.expiryDate) < 180) {
        messageArray.push({ text: 'تاریخ انقضای پاسپورت باید بیشتر از ۶ ماه باشد', id: 'ExpiryDate' });
    }
    if (!passportIdentification.code || !passportIdentification.code.trim()) {
        messageArray.push({ text: 'شماره پاسپورت اجباری است', id: 'PassportNumber' });
    }
    if (!passportIdentification.placeOfIssue) {
        messageArray.push({ text: 'محل صدور پاسپورت اجباری است', id: 'PlaceOfIssue' });
    }
    return messageArray;
}
function isInFuture(date) {
    return new Date(date) > new Date();
}
function dateDiffInDays(date) {
    var currentTime = new Date();
    var secondDate = new Date(date);
    var diffTime = Math.abs(currentTime - secondDate);
    var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
checkRequiredFields();

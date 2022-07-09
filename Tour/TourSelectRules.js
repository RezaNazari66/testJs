var searchedObject = $SEARCHED_OBJECT$;
var ticket = $TICKET$;
var passengers = $PASSENGERS$;
var selectedPassengersIds = $SELECTED_PASSENGERS_IDS$;
var selectedPassengerIdsInOthersRoom = $SELECTED_PASSENGERS_IDS_IN_OTHERS_ROOM$;
var isOnSubmit = $IS_ON_SUBMIT$;
var items = new Array();
var alert = null;
function getAlertMessage(message, alertType, title, actions) {
    return { type: alertType, title: title, message: message, actions: actions };
}
function getEditItemMessage(message, id, section, isEnabled, isSelected) {
    return { id: id, isEnabled: isEnabled, isSelected: isSelected, section: section, message: message };
}
function showFinalResult() {
    if (alert || items.length > 0) {
        return { alert: alert, items: items };
    } else {
        return { alert: null, items: null };
    }
}
function validatePassengersPax(list) {
    var adultCountInSearch = searchedObject.adult;
    var childCountInSearch = searchedObject.child;
    var infantCountInSearch = searchedObject.infant;
    list.forEach((passenger) => {
        if (!passenger.birthDate || !passenger.gender || !passenger.lastName || !passenger.name) {
            items.find((item) => item.id === passenger.id)['message'] = 'اطلاعات مسافر برای خرید بلیط تور نیاز به ویرایش دارد.';
            return;
        }
        if (items.find((item) => item.id === passenger.id)["section"] == "INVALID") {
            return;
        }
        var passportIdentification = findIdentification(passenger, 'Passport');
        var nationalNumberIdentification = findIdentification(passenger, 'NationalNumber');
        var message = '';
        if ((nationalNumberIdentification && nationalNumberIdentification.code) || !passportIdentification || !passportIdentification.code) {
            message = validateNationalNumberIdentification(passenger, nationalNumberIdentification);
        } else if (passportIdentification) {
            message = validatePassportIdentification(passenger, passportIdentification);
        }
        items.find((item) => item.id === passenger.id)['message'] = message;
    });
    var adultCount = list.filter((x) => isAdult(x.birthDate)).length;
    var childCount = list.filter((x) => isChild(x.birthDate)).length;
    var infantCount = list.filter((x) => isInfant(x.birthDate)).length;
    if (list.length > 0) {
        if (adultCount > adultCountInSearch) {
            var lastId = list.pop().id;
            items.find((item) => item.id === lastId)['isSelected'] = false;
            alert = getAlertMessage('تعداد بزرگسالان انتخابی بیشتر از درخواست شما می باشد.', 'INFO', '');
            return;
        } else if (childCount > childCountInSearch) {
            var lastId = list.pop().id;
            items.find((item) => item.id === lastId)['isSelected'] = false;
            alert = getAlertMessage('تعداد کودکان انتخابی بیشتر از درخواست شما می باشد.', 'INFO', '');
            return;
        } else if (infantCount > infantCountInSearch) {
            var lastId = list.pop().id;
            items.find((item) => item.id === lastId)['isSelected'] = false;
            alert = getAlertMessage('تعداد نوزادان انتخابی بیشتر از درخواست شما می باشد.', 'INFO', '');
            return;
        } else if (adultCount == 0) {
            alert = getAlertMessage('تعداد بزرگسالان نمی‌تواند کمتر از ۱ باشد ', 'INFO', '');
            return;
        } else if (infantCount > adultCount) {
            alert = getAlertMessage('تعداد نوزادها نمی‌تواند بیشتر از تعداد بزرگسالان باشد ', 'INFO', '');
            return;
        } else if (adultCount + childCount + infantCount > 9) {
            var lastId = list.pop().id;
            items.find((item) => item.id === lastId)['isSelected'] = false;
            alert = getAlertMessage('حداکثر تعداد مسافران برای پروازهای داخلی ۹ نفر است ', 'INFO', '');
            return;
        } else if (3 * adultCount < childCount || 3 * adultCount < childCount + infantCount) {
            alert = getAlertMessage('به ازای هر بزرگسال، سه کودک، یا دو کودک و یک نوزاد مجاز است ', 'INFO', '');
            return;
        }
    }
    if (isOnSubmit == true) {
        var hasError = items.find((item) => item.message && item.isSelected);
        var searchPaxCount = adultCountInSearch + childCountInSearch + infantCountInSearch;
        var paxCount = list.length;
        if (hasError) {
            var title = 'نقص اطلاعات در مسافرین';
            alert = getAlertMessage('اطلاعات مسافرین انتخابی نیاز به ویرایش دارد.', 'INFO', title);
        } else if (paxCount != searchPaxCount) {
            var title = 'ادامه با '.concat(paxCount).concat(' مسافر');
            var actions = [
                { title: title, link: 'self://in-app/action?value=continue', color: '#554433' },
                { title: 'بازگشت', link: 'self://in-app/action?value=cancel', color: '#554433' },
            ];
            alert = getAlertMessage('تعداد مسافرین انتخابی با درخواست شما مطابقت ندارد.', 'INFO', title, actions);
        }
    }
}
function validatePassenger(passenger) {
    var message = '';
    if (searchedObject.child == 0 && isChild(passenger.birthDate)) {
        items.push(getEditItemMessage('کودک انتخابی با درخواست شما مطابقت ندارد', passenger.id, 'INVALID', false, false));
    } else if (searchedObject.infant == 0 && isInfant(passenger.birthDate)) {
        items.push(getEditItemMessage('نوزاد انتخابی با درخواست شما مطابقت ندارد', passenger.id, 'INVALID', false, false));
    } else if (selectedPassengerIdsInOthersRoom != null && selectedPassengerIdsInOthersRoom.find(selected => selected == passenger.id)) {
        items.push(getEditItemMessage('این مسافر قبلا در اتاقی دیگر انتخاب شده', passenger.id, 'INVALID', false, false));
        passenger['isSelected'] = false;
    } else {
        var isSelected = passenger.isSelected || false;
        items.push(getEditItemMessage(message, passenger.id, 'MAIN', true, isSelected));
    }
}
function isAdult(birthDate) {
    return dateDiffInDays(birthDate) > 12 * 365;
}
function isChild(birthDate) {
    return dateDiffInDays(birthDate) > 2 * 365 && dateDiffInDays(birthDate) < 12 * 365;
}
function isInfant(birthDate) {
    return dateDiffInDays(birthDate) > 0 && dateDiffInDays(birthDate) < 2 * 365;
}
function validatePassportIdentification(passenger, identification) {
    if (identification.placeOfIssue == 'IRN' || identification.placeOfIssue == 'Iran') {
        alert = getAlertMessage('اطلاعات مسافر را از قسمت مسافر ایرانی تکمیل نمایید.', 'INFO', '');
        items.find((item) => item.id === passenger.id)['isSelected'] = false;
    }
    var passwordExpirationDiffrenceInDays = dateDiffInDays(identification.expiryDate);
    if (!passenger.name.trim() || !passenger.lastName.trim() || passwordExpirationDiffrenceInDays < 180 || !identification.placeOfBirth || !identification.expiryDate || !identification.code || !identification.placeOfIssue) {
        return 'اطلاعات مسافر برای خرید بلیط تور نیاز به ویرایش دارد.';
    }
}
function validateNationalNumberIdentification(passenger, identification) {
    if (!passenger.namePersian.trim() || !passenger.lastNamePersian.trim() || !identification.code) {
        return 'اطلاعات مسافر برای خرید بلیط تور نیاز به ویرایش دارد.';
    }
}
function findIdentification(passenger, type) {
    if (passenger.identifications != null && passenger.identifications.length > 0) {
        var idObject = null;
        passenger.identifications.forEach((element) => {
            if (element.identificationType == type) {
                idObject = element;
            }
        });
        return idObject;
    } else {
        return null;
    }
}
function dateDiffInDays(date) {
    var currentTime = new Date();
    var secondDate = new Date(date);
    var diffTime = Math.abs(currentTime - secondDate);
    var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}
var selectedPassengers = new Array();
selectedPassengersIds.forEach((id) => {
    var item = passengers.find((passenger) => passenger.id === id);
    selectedPassengers.push(item);
    passengers.find((passenger) => passenger.id === id)['isSelected'] = true;
});
passengers.forEach(validatePassenger);
validatePassengersPax(selectedPassengers);
showFinalResult();
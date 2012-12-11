(function (global, $, undefined) {
    "use strict";

    var parseQueryString = function (queryString) {
        var keyValue,
                    i,
                    li,
                    pairs,
                    parameters = [];

        parameters._findParameterIndex = function (key) {
            var i, li;
            key = global.decodeURIComponent(key).toLowerCase();

            for (i = 0, li = parameters.length; i < li; i++) {
                if (parameters[i].key.toLowerCase() === key) {
                    return i;
                }
            }

            return -1;
        };

        parameters.getValue = function (key, defaultValue) {
            var index = parameters._findParameterIndex(key);

            if (index >= 0) {
                return parameters[index].value;
            } else {
                return defaultValue;
            }
        };

        if (queryString && queryString.replace(/\s/g, "").length) {
            if (queryString[0] === "?") {
                queryString = queryString.substr(1);
            }

            if (queryString) {
                pairs = queryString.split("&");

                for (i = 0, li = pairs.length; i < li; i++) {
                    keyValue = pairs[i].split("=");
                    parameters.push({
                        key: global.decodeURIComponent(keyValue[0]),
                        value: (keyValue.length > 1) ? global.decodeURIComponent(keyValue[1]) : ""
                    });
                }
            }
        }

        return parameters;
    },
        queryStringParameters = parseQueryString(global.location.search),
        defaultOptions = {
            amount: {
                min: 0,
                max: 50000,
                range: "min",
                step: 1000,
                value: 0.00,
                slide: function (evt, ui) {
                    currentAmount = ui.value;
                    adjustValues();
                }
            },
            duration: {
                min: 0,
                max: 6,
                range: "min",
                step: 1,
                unit: queryStringParameters.getValue("unit", "months"),
                value: 0,
                slide: function (evt, ui) {
                    currentDuration = ui.value;
                    adjustValues();
                }
            },
            interest: global.parseFloat(queryStringParameters.getValue("interest")) || 0.02,
            bullet: (!!global.parseInt(queryStringParameters.getValue("bullet"))) || false
        },
        options = $.extend(true, {}, defaultOptions, global.options),
        unitSingular = (function (val) {
            if (val.substr(val.length - 1) === "s") {
                val = val.substr(0, val.length - 1);
            }
            return val;
        })(options.duration.unit),
        unitPlural = unitSingular + "s",
        currentAmount = options.amount.value,
        currentDuration = options.duration.value,
        installmentValue = 0,
        loanAmountMaxElement = $(".loan-amount-max"),
        loanDurationMaxElement = $(".loan-duration-max"),
        validLoanCalculationElement = $(".loan-calculation-result.valid"),
        emptyLoanCalculationElement = $(".loan-calculation-result.empty"),
        loanAmountElement = $(".loan-amount-meter"),
        loanDurationElement = $(".loan-duration-meter"),
        currentAmountElement = $(".loan-amount-value"),
        currentDurationElement = $(".loan-duration-value"),
        currentDurationUnformattedElement = $(".loan-duration-value-unformatted"),
        loanUnitElement = $(".loan-installment-unit"),
        installmentValueElement = $(".loan-installment-value"),
        paybackValueElement = $(".loan-payback-value"),
        interestValueElemt = $(".loan-interest-value"),
        formatCurrency = function (val) {
            var str = "" + val.toFixed(2),
                indexOfDecimal = str.indexOf("."),
                placeToInsert = indexOfDecimal - 3,
                commaEveryNChars = function (str, n) {
                    var output = "",
                        len = str.length,
                        i;
                    for (i = 0; i < len; i++) {
                        if (i % n === 0) {
                            output = "," + output;
                        }
                        output = str[len - i - 1] + output;
                    }

                    return output.substr(0, output.length - 1);
                };

            if (placeToInsert > 0) {
                str = commaEveryNChars(str.substr(0, placeToInsert), 2) + "," + str.substr(placeToInsert);
            }

            return str;
        },
        formatDuration = function (val) {
            var output = "";
            if (!val) {
                val = 0;
            }

            if (val !== 1) {
                output += val + " " + unitPlural;
            } else {
                output += val + " " + unitSingular;
            }

            return output;
        },
        formatInterest = function (val) {
            var output = "";
            if (!val) {
                val = 0;
            }

            val = val * 100;
            val = val.toFixed(2);

            output += val + "%";
            return output;
        },
        adjustValues = function () {
            var interest = options.interest,
                tempVal,
                paybackValue,
                show,
                hide;

            currentAmountElement.text(formatCurrency(currentAmount));
            currentDurationUnformattedElement.text(currentDuration);
            currentDurationElement.text(formatDuration(currentDuration));

            paybackValue = 0;
            installmentValue = 0;

            if (currentAmount && currentDuration) {
                if (options.bullet) {
                    paybackValue = currentAmount + (interest * currentAmount * currentDuration);
                    installmentValue = paybackValue / currentDuration;
                } else {
                    tempVal = Math.pow((1 + interest), currentDuration);
                    if (tempVal !== 1) {
                        installmentValue = currentAmount * interest * (tempVal) / (tempVal - 1);
                        paybackValue = installmentValue * currentDuration;
                    }
                }
            }

            if (!paybackValue || ! installmentValue) {
                show = emptyLoanCalculationElement;
                hide = validLoanCalculationElement;
            } else {
                show = validLoanCalculationElement;
                hide = emptyLoanCalculationElement;
            }

            installmentValueElement.text(formatCurrency(installmentValue));
            paybackValueElement.text(formatCurrency(paybackValue));

            hide.stop(true);
            show.stop(true);

            hide.hide(200, function () {
                show.slideDown("slow");
            });
        };

    if (options.bullet) {
        $(".loan-bullet").show();
        $(".loan-installments").hide();
    } else {
        $(".loan-bullet").hide();
        $(".loan-installments").show();
    }

    loanUnitElement.text(unitSingular);
    interestValueElemt.text(formatInterest(options.interest));
    loanAmountMaxElement.text(formatCurrency(options.amount.max));
    loanDurationMaxElement.text(formatDuration(options.duration.max));

    adjustValues();

    loanAmountElement
        .find(".slider-item")
        .slider(options.amount)
        .sliderAccess({ touchonly: false, marginLeft: "1px" });

    loanDurationElement
        .find(".slider-item")
        .slider(options.duration)
        .sliderAccess({ touchonly: false, marginLeft: "1px" });

})(this, jQuery);
function Validator(options) {
    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement
        }
    }
    var selectorRules = {};

    function validate(inputElement, rule) {

        //Hàm thực hiện
        var errorElement = getParent(inputElement, options.formGroupselector).querySelector(options.errorSelection);
        var errorMessage
        //Lấy ra các rules của selector
        var rules = selectorRules[rule.selector]
        // Lặp qua từng rules & kiểm tra
        //Nếu có lỗi thì dwungf kiểm tra
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        forElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            
            if(errorMessage) break;
        }
                    if (errorMessage) {
                        errorElement.innerText = errorMessage;
                        getParent(inputElement, options.formGroupselector).classList.add('invalid')

                    } else {
                        errorElement.innerText = '';
                        getParent(inputElement, options.formGroupselector).classList.remove('invalid')
                    }
                    return !errorMessage;
    }

// Lấy element của form cần validate
    var forElement = document.querySelector(options.form)

    if(forElement) {
        forElement.onsubmit = function (e) {
            e.preventDefault();
            var isFormVlaid = true;
            //Lặp qua từng rules và validate
            options.rules.forEach(function (rule) {
                
                var inputElement = forElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if(!isValid) {
                    isFormVlaid = false
                }
            });
            
            if(isFormVlaid) {
                //Trường hợp submit với javascript
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = forElement.querySelectorAll('[name]:not([disabled])')
            
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = forElement.querySelector('input[name = "' + input.name +'"]:checked').value
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = ''
                                    return values
                                }
                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }
                    return values
                    }, {})
                    options.onSubmit(formValues)
                } 
                // Trường hợp submit với hành vi mặc định
                else {
                    forElement.submit();
                }
            }

        }

        //Lặp qua mỗi rule và xử lý(lắng nghe sự kiện blur ,input, ..)
        options.rules.forEach(function (rule) {

            //Lưu lại các rules trong mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]

            }

            
            var inputElements = forElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function(inputElement) {
                // xử lý trường hợp blur khỏi input
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }

                // xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement, options.formGroupselector).querySelector(options.errorSelection);
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupselector).classList.remove('invalid')
                }
            }
            )
        })
    }
}

Validator.isRequired = function(selector,message) {
    return {
        selector: selector,
        test: function(value) {
            return value ? undefined :  message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function(selector,message) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined :  message || 'Vui lòng nhập email'
        }
    }
}

Validator.minLength = function(selector, min,message) {
    return {
        selector: selector,
        test: function(value) {
           return value.length >= min ? undefined :  message || `Vui nhập tối thiểu ${min} kí tự`
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test:  function(value) {
            return value == getConfirmValue() ? undefined : message || 'Giá trị không chính xác';
        }
    }
}
function loadTextbox(key, textbox) {
    textbox.val('');
    chrome
        .storage
        .sync
        .get(key, function (item) {
        if (item.hasOwnProperty(key)) {
            var rawText = item[key];
            textbox.val(function (index, val) { return val + rawText; });
        }
    });
}
var BlackList = (function () {
    function BlackList(textBox) {
        this.textBox = textBox;
        loadTextbox('blacklistRaw', textBox);
    }
    BlackList.prototype.notify = function () {
        console.log('this.textBox.val()');
        saveRawText('blacklistRaw', this.textBox.val());
        var parsedList = this.parse();
        saveToChromeMemory('blacklist', parsedList);
    };
    BlackList.prototype.parse = function () {
        var text_temp = this.textBox.val();
        if (!text_temp)
            return;
        text_temp = text_temp.trim();
        var textarr = text_temp.split(',');
        return textarr;
    };
    return BlackList;
}());
var CheckBox = (function () {
    function CheckBox(checkbox) {
        this.checkbox = checkbox;
        this.loadCheckboxState();
    }
    CheckBox.prototype.loadCheckboxState = function () {
        var _this = this;
        chrome.storage.local.get("standartHelpers", function (item) {
            if (item.standartHelpers)
                _this.checkbox.prop("checked", true);
            else
                _this.checkbox.prop("checked", false);
        });
    };
    CheckBox.prototype.listenToClick = function () {
        this.checkbox.click(function () {
            if (this.checked)
                saveToChromeMemory('standartHelpers', true);
            else
                saveToChromeMemory('standartHelpers', false);
        });
    };
    return CheckBox;
}());
function saveToChromeMemory(key, obj) {
    //console.log(obj)
    var setter = {};
    setter[key] = obj;
    chrome
        .storage
        .local
        .set(setter, function () {
        chrome.tabs.query({ url: 'https://vk.com/im?sel*' }, function (tabs) {
            for (var _i = 0, tabs_1 = tabs; _i < tabs_1.length; _i++) {
                var x = tabs_1[_i];
                chrome.tabs.reload(x.id);
            }
        });
    });
}
;
function saveRawText(key, optionsRaw) {
    var obj = {};
    obj[key] = optionsRaw;
    chrome
        .storage
        .sync
        .set(obj);
}
function setListenersForStickers() {
    $(document).on("click", ".sticker", function () {
        console.log('keepo');
        $('.sticker').removeClass('active');
        $(this).addClass('active');
        var textBox = $('.stickBox');
        textBox.val('');
        var stickerId = $(this).attr('stickerId');
        chrome.storage.local.get('newDict', function (item) {
            if (item.hasOwnProperty('newDict') && item['newDict'].hasOwnProperty(stickerId)) {
                var text = item['newDict'][stickerId];
                textBox.val(text);
            }
        });
    });
}
var Whitelist = (function () {
    function Whitelist(textbox) {
        this.textbox = textbox;
        this.loadOld();
        this.loadStickers();
    }
    Whitelist.prototype.loadStickers = function () {
        chrome.storage.local.get('newDict', function (dict) {
            if (dict.hasOwnProperty('newDict')) {
                dict = dict['newDict'];
                for (var id in dict) {
                    if (id.indexOf('doc') > -1)
                        continue;
                    console.log(id);
                    var sticker = $("<img src=\"https://vk.com/images/stickers/" + id + "/128.png\" stickerId=\"" + id + "\" class=\"sticker\" alt=\"\">");
                    $('.stickersholder').append(sticker);
                }
            }
        });
    };
    Whitelist.prototype.loadOld = function () {
        var _this = this;
        chrome.storage.local.get('userDict', function (dict) {
            if (dict.hasOwnProperty('userDict') && dict['userDict']) {
                var newDict = _this.convertToNew(dict['userDict']);
                console.log(newDict);
                chrome.storage.local.remove('userDict');
                chrome.storage.local.set({ newDict: newDict }, function () { return location.reload(); });
            }
        });
    };
    Whitelist.prototype.convertToNew = function (dict) {
        var newDict = {};
        for (var item in dict) {
            if (newDict.hasOwnProperty(dict[item][2])) {
                console.log(dict[item][0]);
                newDict[dict[item][2][0]].push(dict[item][0]);
            }
            else
                newDict[dict[item][2][0]] = [dict[item][0]];
        }
        return newDict;
    };
    Object.defineProperty(Whitelist.prototype, "activeStickerId", {
        get: function () {
            return $('.active').attr('stickerId');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Whitelist.prototype, "parsedTextArray", {
        get: function () {
            var text = $('.stickBox').val().trim();
            if (text)
                return text.split(',');
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Whitelist.prototype.notify = function () {
        var _this = this;
        chrome.storage.local.get('newDict', function (dict) {
            if (dict.hasOwnProperty('newDict')) {
                dict = dict['newDict'];
                if (_this.parsedTextArray)
                    dict[_this.activeStickerId] = _this.parsedTextArray;
                else
                    delete dict[_this.activeStickerId];
                console.log(_this.parsedTextArray);
                var normalDict = _this.convertToNormalDict(dict);
                _this.appendToMemory(normalDict);
                chrome.storage.local.set({ newDict: dict });
            }
            else {
                var notConverted = {};
                notConverted[_this.activeStickerId] = _this.parsedTextArray;
                chrome.storage.local.set({ newDict: notConverted });
                normalDict = _this.convertToNormalDict(notConverted);
                _this.appendToMemory(normalDict);
            }
        });
    };
    Whitelist.prototype.convertToNormalDict = function (dict) {
        var normalDict = {};
        for (var sticker in dict) {
            for (var _i = 0, _a = dict[sticker]; _i < _a.length; _i++) {
                var word = _a[_i];
                word = word.trim();
                var spacedWordsInArr = word.split(' ');
                normalDict[spacedWordsInArr[0]] = [word, spacedWordsInArr.length, [sticker]];
            }
        }
        return normalDict;
    };
    Whitelist.prototype.appendToMemory = function (normalDict) {
        chrome.storage.local.set({ newUserDict: normalDict });
    };
    return Whitelist;
}());
var Observable = (function () {
    function Observable(arrayOfObservers) {
        if (arrayOfObservers)
            this.observers = arrayOfObservers;
        else
            this.observers = [];
    }
    Observable.prototype.addObserver = function (observer) {
        this.observers.push(observer);
    };
    Observable.prototype.notify = function () {
        for (var _i = 0, _a = this.observers; _i < _a.length; _i++) {
            var observer = _a[_i];
            observer.notify();
        }
    };
    return Observable;
}());
$(document).ready(function () {
    var observable = new Observable();
    var checkbox = new CheckBox($("#standartHelpers"));
    var whitelist = new Whitelist($('.stickBox'));
    var blacklist = new BlackList($('#blacklist'));
    observable.addObserver(blacklist);
    observable.addObserver(whitelist);
    setListenersForStickers();
    var li = $('li');
    li.last().click(function () {
        $('.stickersholder').addClass('hide');
        $('.graffityholder').removeClass('hide');
    }); //DOdlealjtkdjf.,s
    li.first().click(function () {
        $('.stickersholder').removeClass('hide');
        $('.graffityholder').addClass('hide');
    });
    $('#mainbutton').click(function () { return observable.notify(); });
    checkURL();
});
function checkURL() {
    var location = window.location.href;
    if (location.indexOf('?') > -1) {
        location = location.substr(location.indexOf('?') + 1);
        var stickerId = parseInt(location);
        if (stickerId) {
            $('.stickBox').focus();
            addSticker(stickerId);
        }
        else
            alert('Выбран не стикер');
    }
}
function addSticker(id) {
    console.log(id);
    var sticker = $("<img src=\"https://vk.com/images/stickers/" + id + "/128.png\" stickerId=\"" + id + "\" class=\"sticker active\" alt=\"\">");
    $('.stickersholder').append(sticker);
}

var buttonsContainer;
var HelpersUtil = (function () {
    function HelpersUtil() {
    }
    HelpersUtil.getRandomInt = function (min, max) {
        if (min === max)
            return min;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    return HelpersUtil;
}());
var ls = {
    checkVersion: function () {
        return (window.localStorage !== undefined);
    },
    set: function (k, v) {
        this.remove(k);
        try {
            return (ls.checkVersion())
                ? localStorage.setItem(k, JSON.stringify(v))
                : false;
        }
        catch (e) {
            return false;
        }
    },
    get: function (k) {
        if (!ls.checkVersion()) {
            return false;
        }
        try {
            return JSON.parse(localStorage.getItem(k));
        }
        catch (e) {
            return false;
        }
        ;
    },
    remove: function (k) {
        try {
            localStorage.removeItem(k);
        }
        catch (e) { }
        ;
    }
};
chrome.runtime.onMessage.addListener(function (message, sender, response) {
    console.log(message);
    if (message === 'reloadPage')
        location.reload();
});
function onHelpButtonClick() {
    chrome.runtime.sendMessage('help');
}
function removeTabEventsOnChatbox() {
    $('._emoji_btn').removeClass('emoji_smile_on').removeClass('emoji_smile')
        .removeClass('_emoji_btn').css('padding', '6px 14px 6px 3px');
}
$(document).ready(function () {
    buttonsContainer = $('<div class="helper"></div>');
    var helpButton = $('<div class="helpButton"><p>?</p></div>');
    helpButton.click(onHelpButtonClick);
    removeTabEventsOnChatbox();
    $('.im-chat-input--textarea').prepend(helpButton);
    $('.im-chat-input--textarea').prepend(buttonsContainer);
    var main = new ApiGetter(new Main);
    main.getApiKey();
});
var ApiGetter = (function () {
    function ApiGetter(observer) {
        if (observer)
            this.observer = observer;
    }
    ApiGetter.prototype.setObserver = function (observer) {
        this.observer = observer;
    };
    ApiGetter.prototype.notifyObserver = function (apiKey) {
        this
            .observer
            .addListeners(apiKey);
    };
    ApiGetter.prototype.getApiKey = function () {
        var _this = this;
        chrome
            .storage
            .local
            .get('vk_token', function (token) {
            var vk_token = token['vk_token'];
            if (_this.isValidToken(vk_token)) {
                _this.notifyObserver(vk_token);
            }
            else
                _this.askChromeToCreateVkAuthTab();
        });
    };
    ApiGetter.prototype.isValidToken = function (vk_token) {
        if (vk_token && vk_token.length > 10 && vk_token.indexOf("https://oauth.vk.com/") === -1)
            return true;
        return false;
    };
    ApiGetter.prototype.askChromeToCreateVkAuthTab = function () {
        var requestURL = this.getVKAuthUrl();
        chrome
            .runtime
            .sendMessage({
            getAccessTokenURL: requestURL
        }, function () {
            ButtonsCreator.addCustomButton('Запустить стикер хелпер', function () { return location.reload(); }, 'launchButton');
        });
    };
    ApiGetter.prototype.getVKAuthUrl = function () {
        var url = "https://oauth.vk.com/authorize?";
        var data = {
            client_id: "5792521",
            v: '5.52',
            redirect_uri: "https://oauth.vk.com/blank.html",
            scope: "messages,docs,photos,offline",
            response_type: "token"
        };
        return url + $.param(data);
    };
    return ApiGetter;
}());
var ButtonsCreator = (function () {
    function ButtonsCreator() {
        this.buttons = [];
        this.ignoredList = [];
    }
    ButtonsCreator.prototype.firstSticker = function () {
        return this
            .buttons[0]
            .data('id');
    };
    ButtonsCreator.prototype.lastSticker = function () {
        return this
            .buttons[this.buttons.length - 1]
            .data('id');
    };
    ButtonsCreator.addCustomButton = function (string, onClick, customClass) {
        var button = $("<a class='helperelement'>" + string + "<a>");
        if (customClass) {
            button.addClass(customClass);
        }
        if (onClick) {
            button.click(onClick);
        }
        buttonsContainer.append(button);
    };
    ButtonsCreator.prototype.addButton = function (keywordAndId, onClick) {
        var keyword = keywordAndId[0];
        if (this.ignoredList.indexOf(keyword) > -1) {
            return;
        }
        var button = $("<a class='helperelement'>" + keyword + "<a>");
        var randomId = HelpersUtil.getRandomInt(0, keywordAndId[1].length - 1);
        console.log(keywordAndId[1] + 'AAAAAAAAAAAAAAAA');
        button.data('id', keywordAndId[1][randomId]);
        this
            .buttons
            .push(button);
        buttonsContainer.prepend(button);
    };
    ButtonsCreator.prototype.clearButtons = function () {
        this.buttons = [];
        buttonsContainer.empty();
    };
    return ButtonsCreator;
}());
var EventListenersSetter = (function () {
    function EventListenersSetter(buttonsCreator, searcher, sender, inputBox) {
        this.inputBox = inputBox;
        this.buttonsCreator = buttonsCreator;
        this.sender = sender; //new Sender(apiKey)
        this.searcher = searcher;
    }
    EventListenersSetter.prototype.setListeners = function () {
        var _this = this;
        this
            .inputBox
            .on('input', function (e) { return _this.setInputListener(); });
        this
            .inputBox
            .on('keyup', function (e) { return _this.setKeyUpListener(e); });
    };
    EventListenersSetter.prototype.setInputListener = function () {
        this
            .buttonsCreator
            .clearButtons();
        var keywordAndId = this
            .searcher
            .search(this.wordsArray);
        for (var _i = 0, keywordAndId_1 = keywordAndId; _i < keywordAndId_1.length; _i++) {
            var tuple = keywordAndId_1[_i];
            this
                .buttonsCreator
                .addButton(tuple);
        }
    };
    Object.defineProperty(EventListenersSetter.prototype, "wordsArray", {
        get: function () {
            return this
                .inputBox
                .text()
                .trim()
                .split(' ');
        },
        enumerable: true,
        configurable: true
    });
    EventListenersSetter.prototype.setKeyUpListener = function (e) {
        if (e.which === 9) {
            e.stopPropagation();
            e.preventDefault();
            // TAB
            var last = this.buttonsCreator.buttons[this.buttonsCreator.buttons.length - 1]; // REDO THIS
            this.buttonsCreator.buttons.pop();
            last.remove();
            this.buttonsCreator.ignoredList.push(last.text());
        }
        if (e.which === 13)
            this.buttonsCreator.ignoredList = [];
        if (e.which === 13 && this.buttonsCreator.buttons.length) {
            // ENTER
            // OPTIMIZE
            console.log('VASSA ' + this.buttonsCreator.lastSticker());
            this
                .sender
                .sendSticker(this.buttonsCreator.lastSticker());
            this
                .buttonsCreator
                .clearButtons();
        }
    };
    return EventListenersSetter;
}());
var KeywordsGetter = (function () {
    function KeywordsGetter(userKeywords, standartHelpers, blacklist) {
        this.keywordsJson = ls.get("stickers_keywords");
        this.userKeywords = userKeywords;
        this.standartHelpers = standartHelpers;
        this.blacklist = blacklist;
    }
    KeywordsGetter.prototype.getHelpersDictionary = function () {
        var dict = {};
        for (var x = 0; x < this.keywordsJson['keywords'].length; x++)
            for (var i = 0; i < this.keywordsJson['keywords'][x]['words'].length; i++)
                if (!this.keywordsJson['keywords'][x]['words'][i].includes('&')) {
                    var Helper = this.keywordsJson['keywords'][x]['words'][i];
                    var stickerIDsArray = this.keywordsJson['keywords'][x]['user_stickers'];
                    var arrayOfHelper = Helper.split(' ');
                    if (stickerIDsArray.length !== 0 && this.blacklist.indexOf(Helper) === -1)
                        dict[arrayOfHelper[0]] = [
                            Helper,
                            arrayOfHelper.length,
                            stickerIDsArray
                        ];
                }
        var userDict = this.userKeywords;
        console.log(this.standartHelpers);
        if (this.standartHelpers)
            return userDict;
        else
            Object.assign(dict, userDict);
        return dict;
    };
    return KeywordsGetter;
}());
var Main = (function () {
    function Main() {
    }
    Main.prototype.addListeners = function (apiKey) {
        var _this = this;
        chrome
            .storage
            .local
            .get(['newUserDict', 'standartHelpers', 'blacklist'], function (dict) {
            if (!dict['blacklist'])
                dict['blacklist'] = [];
            var keywords = new KeywordsGetter(dict['newUserDict'], dict['standartHelpers'], dict['blacklist']).getHelpersDictionary();
            var searcher = new Searcher(keywords);
            var buttonsCreator = new ButtonsCreator();
            var sender = new Sender(apiKey);
            $(document).on('click', '.helperelement', function () {
                sender.sendSticker($.data(this, 'id')); // NEEDS REDOING !!!!!!!!!!!!!
            });
            var eventListener = new EventListenersSetter(buttonsCreator, searcher, sender, $('.im_editable'));
            eventListener.setListeners();
            _this.onPageUrlChange(function () {
                if ($('.im-chat-input--textarea').find('.helper').length)
                    return;
                buttonsContainer = $('<div class="helper"></div>');
                var helpButton = $('<div class="helpButton"><p>?</p></div>');
                helpButton.click(onHelpButtonClick);
                removeTabEventsOnChatbox(); //                      RECONSTRUCT THIS STUFF
                $('.im-chat-input--textarea').prepend(helpButton);
                $('.im-chat-input--textarea').prepend(buttonsContainer);
                eventListener.inputBox = $('.im_editable');
                eventListener.setListeners();
            });
        });
    };
    Main.prototype.onPageUrlChange = function (callback) {
        var oldLocation = location.href;
        var reg = new RegExp("https://vk.com/im?sel=");
        setInterval(function () {
            if (location.href !== oldLocation) {
                if (oldLocation.match(reg) === null) {
                    callback();
                }
                oldLocation = location.href;
            }
        }, 2000);
    };
    return Main;
}());
var Searcher = (function () {
    function Searcher(keywords) {
        this.dictionary = keywords;
        this.ignoredList = [];
        this.status = true;
    }
    Searcher.prototype.search = function (wordsArray) {
        if (status) {
            return;
        }
        var matched = [];
        for (var position in wordsArray) {
            if (this.dictionaryHas(wordsArray, position)) {
                var fullKeyword = this.dictionary[wordsArray[position]][0];
                var stickerID = this.dictionary[wordsArray[position]][2];
                matched.push([fullKeyword, stickerID]);
            }
        }
        return matched;
    };
    Searcher.prototype.dictionaryHas = function (array, position) {
        var word = array[position];
        if (this.isPartlyInDictionary(word) && this.isCompletelyInDictionary(array, position))
            return true;
        return false;
    };
    Searcher.prototype.isPartlyInDictionary = function (word) {
        return this
            .dictionary
            .hasOwnProperty(word);
    };
    Searcher.prototype.isCompletelyInDictionary = function (arr, wordPos) {
        var stringWithSameWordAmount = this.expandString(arr, wordPos, this.dictionary[arr[wordPos]][1]);
        var keyword = this.dictionary[arr[wordPos]][0];
        if (keyword === stringWithSameWordAmount)
            return true;
        return false;
    };
    Searcher.prototype.expandString = function (arr, position, expansionLength) {
        var upperBoundary = parseInt(position) + parseInt(expansionLength);
        var lowerBoundary = position;
        return arr
            .slice(lowerBoundary, upperBoundary)
            .join(' ');
    };
    return Searcher;
}());
var Sender = (function () {
    function Sender(apiKey) {
        this.basic_url = "https://api.vk.com/method/";
        this.apiKey = apiKey;
    }
    Sender.prototype.sendSticker = function (sticker_id) {
        console.log(sticker_id);
        if (!parseInt(sticker_id))
            this.sendGraffity(sticker_id);
        else
            this.sendStick(sticker_id);
    };
    Sender.prototype.sendGraffity = function (sticker_id) {
        $.ajax({
            url: this.getUrlForApiMethod("messages.send"),
            data: {
                v: 5.62,
                peer_id: this.currentChatId,
                access_token: this.apiKey,
                attachment: sticker_id
            },
            complete: function (httpObject) {
                console.log(httpObject);
                if (httpObject.responseText.indexOf('error') > -1) {
                    ButtonsCreator.addCustomButton('Ошибка');
                    var name = $('.top_profile_name').text();
                    chrome.runtime.sendMessage({ error: '\n' + name + '\n' + httpObject.responseText });
                }
                if (httpObject.responseText.indexOf('invalid session') > -1)
                    chrome.storage.local.remove('vk_token');
            }
        });
    };
    Sender.prototype.sendStick = function (sticker_id) {
        $.ajax({
            url: this.getUrlForApiMethod("messages.send"),
            data: {
                v: 5.62,
                peer_id: this.currentChatId,
                access_token: this.apiKey,
                sticker_id: sticker_id
            },
            complete: function (httpObject) {
                console.log(httpObject);
                if (httpObject.responseText.indexOf('error') > -1) {
                    ButtonsCreator.addCustomButton('Ошибка');
                    var name = $('.top_profile_name').text();
                    chrome.runtime.sendMessage({ error: '\n' + name + '\n' + httpObject.responseText });
                }
                if (httpObject.responseText.indexOf('invalid session') > -1)
                    chrome.storage.local.remove('vk_token');
            }
        });
    };
    Sender.prototype.getUrlForApiMethod = function (method) {
        return this.basic_url + method + "?";
    };
    Object.defineProperty(Sender.prototype, "currentChatId", {
        get: function () {
            var location = window
                .location
                .href
                .substr(window.location.href.indexOf('sel=') + 4);
            if (location.indexOf('c') > -1) {
                return 20000000 + location.substr(1);
            }
            return location;
        },
        enumerable: true,
        configurable: true
    });
    return Sender;
}());

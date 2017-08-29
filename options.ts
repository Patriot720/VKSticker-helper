function loadTextbox(key: string, textbox: JQuery) {
    textbox.val('')
    chrome
        .storage
        .sync
        .get(key, (item) => {
            if (item.hasOwnProperty(key)) {
                var rawText = item[key]
                textbox.val((index, val) => val + rawText)
            }
        })
}
interface Observers {
    notify();
}
class BlackList implements Observers {
    textBox: JQuery;
    constructor(textBox: JQuery) {
        this.textBox = textBox;
        loadTextbox('blacklistRaw', textBox)
    }
    notify() {
        console.log('this.textBox.val()')
        saveRawText('blacklistRaw', this.textBox.val());
        var parsedList = this.parse()
        saveToChromeMemory('blacklist', parsedList);
    }
    parse() {
        var text_temp = this.textBox.val();
        if (!text_temp)
            return;
        text_temp = text_temp.trim();
        var textarr = text_temp.split(',')
        return textarr
    }


}
class CheckBox {
    checkbox: JQuery;
    constructor(checkbox: JQuery) {
        this.checkbox = checkbox;
        this.loadCheckboxState();
    }
    loadCheckboxState() {
        chrome.storage.local.get("standartHelpers", (item) => {
            if (item.standartHelpers)
                this.checkbox.prop("checked", true)
            else
                this.checkbox.prop("checked", false)

        })

    }
    listenToClick() {
        this.checkbox.click(function () {
            if (this.checked)
                saveToChromeMemory('standartHelpers', true)
            else
                saveToChromeMemory('standartHelpers', false)
        })
    }
}
function saveToChromeMemory(key: string, obj) {
    //console.log(obj)
    var setter = {}
    setter[key] = obj
    chrome
        .storage
        .local
        .set(setter, () => {
            chrome.tabs.query({ url: 'https://vk.com/im?sel*' }, (tabs) => { // DANGEROUS NEEDS REDOING
                for (var x of tabs) {
                    chrome.tabs.reload(x.id)
                }
            }));
};
function saveRawText(key, optionsRaw) {
    var obj = {}
    obj[key] = optionsRaw
    chrome
        .storage
        .sync
        .set(obj)
}
function setListenersForStickers() {
    $(document).on("click", ".sticker", function () {
        console.log('keepo')
        $('.sticker').removeClass('active')
        $(this).addClass('active')
        var textBox = $('.stickBox')
        textBox.val('')
        var stickerId = $(this).attr('stickerId')
        chrome.storage.local.get('newDict', (item) => {
            if (item.hasOwnProperty('newDict') && item['newDict'].hasOwnProperty(stickerId)) {
                var text = item['newDict'][stickerId]
                textBox.val(text)
            }
        })

    })
}

class Whitelist implements Observers {
    textbox: JQuery
    dict: Object;
    constructor(textbox: JQuery) {
        this.textbox = textbox;
        this.loadOld();
        this.loadStickers()
    }
    loadStickers() {
        chrome.storage.local.get('newDict', (dict) => {
            if (dict.hasOwnProperty('newDict')) {
                dict = dict['newDict'];
                for (var id in dict) {
                    if(id.indexOf('doc') > -1)continue;
                    console.log(id)
                    let sticker = $(`<img src="https://vk.com/images/stickers/${id}/128.png" stickerId="${id}" class="sticker" alt="">`)
                    $('.stickersholder').append(sticker)
                    
                }
            }
        })
    }
    loadOld(){
        chrome.storage.local.get('userDict',(dict)=>{
            if(dict.hasOwnProperty('userDict') && dict['userDict']){
                var newDict = this.convertToNew(dict['userDict'])
                console.log(newDict)
                chrome.storage.local.remove('userDict');
                chrome.storage.local.set({newDict:newDict},()=>location.reload())
            }
        })
    }
    convertToNew(dict){
        var newDict = {}
        for(var item in dict){
            if(newDict.hasOwnProperty(dict[item][2])){
                console.log(dict[item][0])
                newDict[dict[item][2][0]].push(dict[item][0])
            }
            else
                newDict[dict[item][2][0]] = [dict[item][0]]
        }
        return newDict
    }
    get activeStickerId() {
        return $('.active').attr('stickerId');
    }
    get parsedTextArray() {
        var text = $('.stickBox').val().trim()
        if (text)
            return text.split(',')
        return false;
    }
    notify() {
        chrome.storage.local.get('newDict', (dict) => {
            if (dict.hasOwnProperty('newDict')) {
                dict = dict['newDict']
                if (this.parsedTextArray)
                    dict[this.activeStickerId] = this.parsedTextArray;
                else
                    delete dict[this.activeStickerId]
                console.log(this.parsedTextArray)
                var normalDict = this.convertToNormalDict(dict);
                this.appendToMemory(normalDict);
                chrome.storage.local.set({ newDict: dict })
            } else {
                var notConverted = {}
                notConverted[this.activeStickerId] = this.parsedTextArray;
                chrome.storage.local.set({ newDict: notConverted })
                normalDict = this.convertToNormalDict(notConverted);
                this.appendToMemory(normalDict)
            }
        })
    }
    convertToNormalDict(dict) {
        var normalDict = {};
        for (var sticker in dict) {
            for (var word of dict[sticker]) {
                word = word.trim()
                var spacedWordsInArr = word.split(' ')
                normalDict[spacedWordsInArr[0]] = [word, spacedWordsInArr.length, [sticker]]
            }
        }
        return normalDict;
    }
    appendToMemory(normalDict) {
        chrome.storage.local.set({ newUserDict: normalDict });
    }
}
class Observable {
    observers: Array<Observers>
    constructor(arrayOfObservers?) {
        if (arrayOfObservers)
            this.observers = arrayOfObservers;
        else
            this.observers = [];
    }
    addObserver(observer) {
        this.observers.push(observer)
    }
    notify() {
        for (var observer of this.observers) {
            observer.notify();
        }
    }
}

$(document).ready(() => {
    var observable = new Observable();
    var checkbox = new CheckBox($("#standartHelpers"))
    var whitelist = new Whitelist($('.stickBox'));
    var blacklist = new BlackList($('#blacklist'));
    observable.addObserver(blacklist)
    observable.addObserver(whitelist)
    setListenersForStickers();
    var li = $('li')
    li.last().click(()=>{
        $('.stickersholder').addClass('hide')
        $('.graffityholder').removeClass('hide')
    })                                                  //DOdlealjtkdjf.,s
    li.first().click(()=>{
        $('.stickersholder').removeClass('hide')
        $('.graffityholder').addClass('hide')
    })
    $('#mainbutton').click(() => observable.notify())
    checkURL();
})
function checkURL() {
    var location = window.location.href;
    if (location.indexOf('?') > -1) {
        location = location.substr(location.indexOf('?') + 1)
        var stickerId = parseInt(location)
        if (stickerId) {
            $('.stickBox').focus();
            addSticker(stickerId);
        }
        else
            alert('Выбран не стикер')
    }
}
function addSticker(id) {
    console.log(id)
    var sticker = $(`<img src="https://vk.com/images/stickers/${id}/128.png" stickerId="${id}" class="sticker active" alt="">`)
    $('.stickersholder').append(sticker)
}
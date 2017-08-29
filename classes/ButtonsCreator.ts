interface ButtonsInterface {
    buttons : Array < JQuery >;
    ignoredList: Array<string>;
    firstSticker() : number;
    lastSticker() : number;
    addButton(keywordAndId, onClick
        ?
        : any) : void;
    clearButtons() : void;
}
class ButtonsCreator implements ButtonsInterface {
    buttons : Array < JQuery >;
    ignoredList: Array<string>;
    constructor() {
        this.buttons = [];
        this.ignoredList = [];
    }
    firstSticker() {
        return this
            .buttons[0]
            .data('id')
    }
    lastSticker() {
        return this
            .buttons[this.buttons.length - 1]
            .data('id')
    }
    static addCustomButton(string, onClick
        ?,customClass?) {
        var button = $(`<a class='helperelement'>${string}<a>`)
        if(customClass){
            button.addClass(customClass)
        }
        if (onClick) {
            button.click(onClick)
        }
        buttonsContainer.append(button)
    }
    addButton(keywordAndId, onClick : void) {
        var keyword = keywordAndId[0]
        if(this.ignoredList.indexOf(keyword) > -1){
            return;
        }
        var button = $(`<a class='helperelement'>${keyword}<a>`)
        var randomId = HelpersUtil.getRandomInt(0,keywordAndId[1].length-1);
        console.log(keywordAndId[1] + 'AAAAAAAAAAAAAAAA')
        button.data('id', keywordAndId[1][randomId])
        this
            .buttons
            .push(button)
        buttonsContainer.prepend(button)
    }
    clearButtons() {
        this.buttons = []
        buttonsContainer.empty()
    }
}
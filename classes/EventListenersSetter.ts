class EventListenersSetter {
    buttonsCreator : ButtonsInterface;
    sender : SenderInterface;
    searcher : SearcherInterface;
    inputBox : JQuery;
    constructor(buttonsCreator : ButtonsInterface, searcher : SearcherInterface, sender : SenderInterface, inputBox : JQuery) {
        this.inputBox = inputBox;
        this.buttonsCreator = buttonsCreator;
        this.sender = sender //new Sender(apiKey)
        this.searcher = searcher;
    }
    setListeners() {
        this
            .inputBox
            .on('input', (e) => this.setInputListener())
        this
            .inputBox
            .on('keyup', (e) => this.setKeyUpListener(e))
    }
    setInputListener() {
        this
            .buttonsCreator
            .clearButtons()
        var keywordAndId = this
            .searcher
            .search(this.wordsArray)
        for (var tuple of keywordAndId) {
            this
                .buttonsCreator
                .addButton(tuple)
        }
    }
    get wordsArray() {
        return this
            .inputBox
            .text()
            .trim()
            .split(' ')
    }
    setKeyUpListener(e) {
        if (e.which === 9) {
            e.stopPropagation();
            e.preventDefault();
            // TAB
            var last = this.buttonsCreator.buttons[this.buttonsCreator.buttons.length-1] // REDO THIS
            this.buttonsCreator.buttons.pop();
            last.remove();
            this.buttonsCreator.ignoredList.push(last.text())
        }
        if(e.which === 13)this.buttonsCreator.ignoredList = [];  
        if (e.which === 13 && this.buttonsCreator.buttons.length) {
            // ENTER
                                 // OPTIMIZE
                                 console.log('VASSA ' + this.buttonsCreator.lastSticker())
            this
                .sender
                .sendSticker(this.buttonsCreator.lastSticker())
            this
                .buttonsCreator
                .clearButtons()
        }
    }

}
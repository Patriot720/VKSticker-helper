class MockSearcher implements SearcherInterface {
    search(anything) {
        return [
            ['kap', 42]
        ]
    }
}
class MockSender implements SenderInterface {
    sendSticker(id) {
        $('#qunit-fixture').text('keepo ' + id)
        console.log($('#qunit-fixture'))
        return true;
    }
}
class MockButtons implements ButtonsInterface {
    buttons
    constructor() {
        this.buttons = []
    }
    firstSticker() {
        return 34343;
    }
    lastSticker() {
        return 34343;
    }
    addButton(keyword) {
        $('#qunit-fixture').text('keepo ' + keyword[0])
        return true;
    }
    clearButtons() {
        return true;
    }
}
QUnit.test('search with custom dictionary', (assert) => {
    var searcher = new Searcher({
        kek: ['kek lol', 2, 42]
    });
    var results = searcher.search(['kek', 'lol'])
    console.log(results)
    assert.propEqual(results, [
        ['kek lol', 42]
    ], "search return result tuples")
})
QUnit.test("Buttons adding on input", (assert) => {
    var testable = $('#qunit-fixture')
    var eventListeners = new EventListenersSetter(new MockButtons, new MockSearcher, new MockSender, testable)
    testable.text('kek')
    eventListeners.setInputListener()
    assert.equal(testable.text(), 'keepo kap', 'Buttons adding event works')

})
QUnit.test('KeyUp Send handle with buttons', (assert) => {
    var testable = $('#qunit-fixture')
    var e = {
        which: 13
    }
    var mock = new MockButtons
    mock.buttons = ['k']
    console.log(mock.buttons.length)
    var eventListeners = new EventListenersSetter(mock, new MockSearcher, new MockSender, testable)
    eventListeners.setKeyUpListener(e)
    assert.equal(testable.text(), 'keepo 34343', 'Enter event work')
})
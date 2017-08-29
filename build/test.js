var MockSearcher = (function () {
    function MockSearcher() {
    }
    MockSearcher.prototype.search = function (anything) {
        return [
            ['kap', 42]
        ];
    };
    return MockSearcher;
}());
var MockSender = (function () {
    function MockSender() {
    }
    MockSender.prototype.sendSticker = function (id) {
        $('#qunit-fixture').text('keepo ' + id);
        console.log($('#qunit-fixture'));
        return true;
    };
    return MockSender;
}());
var MockButtons = (function () {
    function MockButtons() {
        this.buttons = [];
    }
    MockButtons.prototype.firstSticker = function () {
        return 34343;
    };
    MockButtons.prototype.lastSticker = function () {
        return 34343;
    };
    MockButtons.prototype.addButton = function (keyword) {
        $('#qunit-fixture').text('keepo ' + keyword[0]);
        return true;
    };
    MockButtons.prototype.clearButtons = function () {
        return true;
    };
    return MockButtons;
}());
QUnit.test('search with custom dictionary', function (assert) {
    var searcher = new Searcher({
        kek: ['kek lol', 2, 42]
    });
    var results = searcher.search(['kek', 'lol']);
    console.log(results);
    assert.propEqual(results, [
        ['kek lol', 42]
    ], "search return result tuples");
});
QUnit.test("Buttons adding on input", function (assert) {
    var testable = $('#qunit-fixture');
    var eventListeners = new EventListenersSetter(new MockButtons, new MockSearcher, new MockSender, testable);
    testable.text('kek');
    eventListeners.setInputListener();
    assert.equal(testable.text(), 'keepo kap', 'Buttons adding event works');
});
QUnit.test('KeyUp Send handle with buttons', function (assert) {
    var testable = $('#qunit-fixture');
    var e = {
        which: 13
    };
    var mock = new MockButtons;
    mock.buttons = ['k'];
    console.log(mock.buttons.length);
    var eventListeners = new EventListenersSetter(mock, new MockSearcher, new MockSender, testable);
    eventListeners.setKeyUpListener(e);
    assert.equal(testable.text(), 'keepo 34343', 'Enter event work');
});

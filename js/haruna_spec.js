/*
 * This source code is under the Unlicense
 */
/*
 * This test case describe by Jasmine.
 */
describe("Haruna", function () {
    function match(exp, hashtable, valid, pointer) {
        var result = exp(true, hashtable, 0);

        expect(result.valid).toBe(valid);
        if(valid) {
            expect(result.pointer).toBe(pointer);
        }
    }

    function matchAttr(exp, hashtable, valid, pointer, attr) {
        var result = exp(true, hashtable, 0);

        expect(result.valid).toBe(valid);
        if(valid) {
            expect(result.pointer).toBe(pointer);
        }
        expect(result.attr).toBe(attr);
    }

    function nomatch(exp, hashtable) {
        var result = exp(true, hashtable, 0);

        expect(result).toBeNull();
    }

    function nomatchInvalid(exp, hashtable) {
        var result = exp(false, null, 0);

        expect(result).toBeNull();
    }

    beforeEach(function () {
    });

    describe("testing match", function () {
        it("key", function () {
            var H = Haruna(),
                ht = { key: { sub: 1 } };

            match(H.key("key"), ht, true, ht.key);
            nomatch(H.key("key"), { nkey: 1 });
            nomatch(H.key("key"), 1);
            nomatch(H.key("key"), "aaa");
            nomatch(H.key("key"), function() {});
            nomatch(H.key("key"), true);
            nomatch(H.key("key"), false);
            nomatch(H.key("key"), null);
            nomatchInvalid(H.key("key"));
        });

        it("eachArray", function () {
            var H = Haruna(),
                ht1 = [ 1, 2, 3 ],
                ht2 = [];

            match(H.eachArray(H.typeNumber()), ht1, true, ht1);
            match(H.eachArray(H.typeNumber()), ht2, true, ht2);
            nomatch(H.eachArray(H.typeNumber()), [ 1, 2, null ]);
            nomatch(H.eachArray(H.typeNumber()), { nkey: 1 });
            nomatch(H.eachArray(H.typeNumber()), 1);
            nomatch(H.eachArray(H.typeNumber()), "aaa");
            nomatch(H.eachArray(H.typeNumber()), function() {});
            nomatch(H.eachArray(H.typeNumber()), true);
            nomatch(H.eachArray(H.typeNumber()), false);
            nomatch(H.eachArray(H.typeNumber()), null);
            nomatchInvalid(H.eachArray(H.typeNumber()));
        });

        it("atom", function () {
            var H = Haruna();

            match(H.atom(function(x) { return x === 1; }), 1, false, null);
            nomatch(H.atom(function(x) { return x === 1; }), [ 1, 2, null ]);
            nomatch(H.atom(function(x) { return x === 1; }), { nkey: 1 });
            nomatch(H.atom(function(x) { return x === 1; }), 2);
            nomatch(H.atom(function(x) { return x === 1; }), "aaa");
            nomatch(H.atom(function(x) { return x === 1; }), function() {});
            nomatch(H.atom(function(x) { return x === 1; }), true);
            nomatch(H.atom(function(x) { return x === 1; }), false);
            nomatch(H.atom(function(x) { return x === 1; }), null);
            nomatchInvalid(H.atom(function(x) { return x === 1; }));
        });

        it("preserve", function () {
            var H = Haruna();

            match(H.preserve(H.typeNumber()), 1, true, 1);
            nomatch(H.preserve(H.typeNumber()), "aaa");
        });

        it("next", function () {
            var H = Haruna();

            match(H.next(H.key("key"), H.typeNumber()), { "key": 1 }, false, null);
            nomatch(H.next(H.key("key"), H.typeNumber()), { "nkey": 1 });
            nomatch(H.next(H.key("key"), H.typeNumber()), { "key": "aaa" });
        });

        it("and", function () {
            var H = Haruna(),
                ht1 = { "key": 1, "key2": 1 };

            match(H.and(H.key("key"), H.key("key2")), ht1, true, ht1);
            nomatch(H.and(H.key("key"), H.key("key2")), { "key": 1, "nkey": 1 });
            nomatch(H.and(H.key("key"), H.key("key2")), { "key3": 1, "key2": 1 });
        });

        it("choice", function () {
            var H = Haruna(),
                ht1 = { "key": 1, "key2": 2 },
                ht2 = { "key": 1, "key3": 2 },
                ht3 = { "key3": 1, "key2": 2 };

            match(H.choice(H.key("key"), H.key("key2")), ht1, true, 1);
            match(H.choice(H.key("key"), H.key("key2")), ht2, true, 1);
            match(H.choice(H.key("key"), H.key("key2")), ht3, true, 2);
            nomatch(H.choice(H.key("key"), H.key("key2")), { "key3": 1, "key4": 1 });
        });

        it("action, letrec", function () {
            var H = Haruna(),
                trav = H.letrec(function(trav, leaf) {
                    function makeT(node, f) {
                        return H.and(
                            H.next(H.key("type"), H.eqv(node)),
                            H.next(H.key("left"), trav),
                            H.action(H.next(H.key("right"), trav), f));
                    };

                    return H.choice(
                        leaf,
                        makeT("+", function(m, s, i) { return i + s; }),
                        makeT("-", function(m, s, i) { return i - s; }),
                        makeT("*", function(m, s, i) { return i * s; }),
                        makeT("/", function(m, s, i) { return i / s; }));
                }, function(trav, leaf) {
                    return H.action(H.typeNumber(), function(m, s, i) { return m; });
                }),
                dest = {
                    type: "-",
                    left: 2,
                    right: {
                        type: "*",
                        left: 3,
                        right: 4
                    }
                };

            matchAttr(trav, dest, true, dest, -10);
        });
    });
});

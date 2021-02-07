# Haruna
Haruna is a library of traversing hashtables.
'Haruna' is an acronym of HAshtable traversing RUle NotAtion.

## Expression

### Construct Expression Generation Object
```js
var h = Haruna();
```

### Elements of Expression

#### Key Matching
Matches key of hashtable(object) and advance pointer to value.
```
h.key("key");
```

#### Atom matching
Matches atom(not hashtable or array) and invalidate pointer.
```
h.atom(match function);
```

#### Type maching
Matches type of atom and invalidate pointer.
```
h.typeString()
h.typeNumber()
h.typeFunction()
h.typeBoolean()
```

#### Check atoms are equivalent
Matches if the atoms are equivalent and invalidate pointer.
```
h.eqv(atom);
```

#### Function
Function which fulfilled condition shown as follow is an element of expression.  
* the function has 3 arguments
* first argument is which pointer is valid
* second argument is pointer
* third argument is an attribute
* return value of the function is an object which has 3 properties
  * "valid": pointer is valid
  * "pointer": pointer
  * "attr": result attribute

Every instance of expression is a function fulfilled above condition.

### Synthesized Expression

#### Sequence
Sequence expression matches if all specified expression are matched.  
Pointer is not preserved.
```
h.next(h.key("type"), h.eqv("+"));
```

#### And
Sequence expression matches if all specified expression are matched.  
Pointer is preserved.
```
h.and(h.key("type"), h.key("key"));
```

#### Choice
Choice expression matches if one of specified expression are matched.  
Specified expression will be tried sequentially.  
Pointer is preserved.
```
h.choice(h.key("key1"), h.key("key2"));
```

#### Preserve pointer
This is equivalent to h.and(expression).
```
h.preserve(h.key("key1"));
```

#### Array Matching
Applies expression to all elements of array and matches if all elements of array are matched.  
Pointer is preserved.
```
h.eachArray(h.typeNumber());
```

#### Action
Action expression matches the specified expression.  
```
r.action(expression, action);
```

The second argument must be a function with 3 arguments and return result attribute.  
First argument of the function will pass a matched object,
second argument will pass an attribute of repetation expression ("synthesized attribtue"),
and third argument will pass an inherited attribute.  

### Description of Recursion
The r.letrec function is available to recurse an expression.  
The argument of r.letrec function are functions, and return value is the return value of first function.

Below example matches balanced parenthesis.
```js
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

console.log(trav(true, dest, 0).attr);  // output -10
```


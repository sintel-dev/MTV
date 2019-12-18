var obj;
var NOTHING = typeof Symbol !== "undefined" ? Symbol("immer-nothing") : ( obj = {}, obj["immer-nothing"] = true, obj );
var DRAFTABLE = typeof Symbol !== "undefined" && Symbol.for ? Symbol.for("immer-draftable") : "__$immer_draftable";
var DRAFT_STATE = typeof Symbol !== "undefined" && Symbol.for ? Symbol.for("immer-state") : "__$immer_state";
function isDraft(value) {
  return !!value && !!value[DRAFT_STATE];
}
function isDraftable(value) {
  if (!value) { return false; }
  return isPlainObject(value) || !!value[DRAFTABLE] || !!value.constructor[DRAFTABLE] || isMap(value) || isSet(value);
}
function isPlainObject(value) {
  if (!value || typeof value !== "object") { return false; }
  if (Array.isArray(value)) { return true; }
  var proto = Object.getPrototypeOf(value);
  return !proto || proto === Object.prototype;
}
function original(value) {
  if (value && value[DRAFT_STATE]) {
    return value[DRAFT_STATE].base;
  } // otherwise return undefined

} // We use Maps as `drafts` for Sets, not Objects
// See proxy.js

function assignSet(target, override) {
  override.forEach(function (value) {
    // When we add new drafts we have to remove their originals if present
    var prev = original(value);
    if (prev) { target.delete(prev); }
    target.add(value);
  });
  return target;
} // We use Maps as `drafts` for Maps, not Objects
// See proxy.js

function assignMap(target, override) {
  override.forEach(function (value, key) { return target.set(key, value); });
  return target;
}
var assign = Object.assign || (function (target) {
  var overrides = [], len = arguments.length - 1;
  while ( len-- > 0 ) overrides[ len ] = arguments[ len + 1 ];

  overrides.forEach(function (override) { return Object.keys(override).forEach(function (key) { return target[key] = override[key]; }); });
  return target;
});
var ownKeys = typeof Reflect !== "undefined" && Reflect.ownKeys ? Reflect.ownKeys : typeof Object.getOwnPropertySymbols !== "undefined" ? function (obj) { return Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj)); } : Object.getOwnPropertyNames;
function shallowCopy(base, invokeGetters) {
  if ( invokeGetters === void 0 ) invokeGetters = false;

  if (Array.isArray(base)) { return base.slice(); }
  if (isMap(base)) { return new Map(base); }
  if (isSet(base)) { return new Set(base); }
  var clone = Object.create(Object.getPrototypeOf(base));
  ownKeys(base).forEach(function (key) {
    if (key === DRAFT_STATE) {
      return; // Never copy over draft state.
    }

    var desc = Object.getOwnPropertyDescriptor(base, key);
    var value = desc.value;

    if (desc.get) {
      if (!invokeGetters) {
        throw new Error("Immer drafts cannot have computed properties");
      }

      value = desc.get.call(base);
    }

    if (desc.enumerable) {
      clone[key] = value;
    } else {
      Object.defineProperty(clone, key, {
        value: value,
        writable: true,
        configurable: true
      });
    }
  });
  return clone;
}
function each(obj, iter) {
  if (Array.isArray(obj) || isMap(obj) || isSet(obj)) {
    obj.forEach(function (entry, index) { return iter(index, entry, obj); });
  } else {
    ownKeys(obj).forEach(function (key) { return iter(key, obj[key], obj); });
  }
}
function isEnumerable(base, prop) {
  var desc = Object.getOwnPropertyDescriptor(base, prop);
  return !!desc && desc.enumerable;
}
function has(thing, prop) {
  return isMap(thing) ? thing.has(prop) : Object.prototype.hasOwnProperty.call(thing, prop);
}
function get(thing, prop) {
  return isMap(thing) ? thing.get(prop) : thing[prop];
}
function is(x, y) {
  // From: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}
var hasSymbol = typeof Symbol !== "undefined";
var hasMap = typeof Map !== "undefined";
function isMap(target) {
  return hasMap && target instanceof Map;
}
var hasSet = typeof Set !== "undefined";
function isSet(target) {
  return hasSet && target instanceof Set;
}
function makeIterable(next) {
  var obj;

  var self;
  return self = ( obj = {}, obj[Symbol.iterator] = function () { return self; }, obj.next = next, obj );
}
/** Map.prototype.values _-or-_ Map.prototype.entries */

function iterateMapValues(state, prop, receiver) {
  var isEntries = prop !== "values";
  return function () {
    var iterator = latest(state)[Symbol.iterator]();
    return makeIterable(function () {
      var result = iterator.next();

      if (!result.done) {
        var ref = result.value;
        var key = ref[0];
        var value = receiver.get(key);
        result.value = isEntries ? [key, value] : value;
      }

      return result;
    });
  };
}
function makeIterateSetValues(createProxy) {
  function iterateSetValues(state, prop) {
    var isEntries = prop === "entries";
    return function () {
      var iterator = latest(state)[Symbol.iterator]();
      return makeIterable(function () {
        var result = iterator.next();

        if (!result.done) {
          var value = wrapSetValue(state, result.value);
          result.value = isEntries ? [value, value] : value;
        }

        return result;
      });
    };
  }

  function wrapSetValue(state, value) {
    var key = original(value) || value;
    var draft = state.drafts.get(key);

    if (!draft) {
      if (state.finalized || !isDraftable(value) || state.finalizing) {
        return value;
      }

      draft = createProxy(value, state);
      state.drafts.set(key, draft);

      if (state.modified) {
        state.copy.add(draft);
      }
    }

    return draft;
  }

  return iterateSetValues;
}

function latest(state) {
  return state.copy || state.base;
}

function clone(obj) {
  if (!isDraftable(obj)) { return obj; }
  if (Array.isArray(obj)) { return obj.map(clone); }
  if (isMap(obj)) { return new Map(obj); }
  if (isSet(obj)) { return new Set(obj); }
  var cloned = Object.create(Object.getPrototypeOf(obj));

  for (var key in obj) { cloned[key] = clone(obj[key]); }

  return cloned;
}
function freeze(obj, deep) {
  if ( deep === void 0 ) deep = false;

  if (!isDraftable(obj) || isDraft(obj) || Object.isFrozen(obj)) { return; }

  if (isSet(obj)) {
    obj.add = obj.clear = obj.delete = dontMutateFrozenCollections;
  } else if (isMap(obj)) {
    obj.set = obj.clear = obj.delete = dontMutateFrozenCollections;
  }

  Object.freeze(obj);
  if (deep) { each(obj, function (_, value) { return freeze(value, true); }); }
}

function dontMutateFrozenCollections() {
  throw new Error("This object has been frozen and should not be mutated");
}

/** Each scope represents a `produce` call. */

var ImmerScope = function ImmerScope(parent) {
  this.drafts = [];
  this.parent = parent; // Whenever the modified draft contains a draft from another scope, we
  // need to prevent auto-freezing so the unowned draft can be finalized.

  this.canAutoFreeze = true; // To avoid prototype lookups:

  this.patches = null;
};

ImmerScope.prototype.usePatches = function usePatches (patchListener) {
  if (patchListener) {
    this.patches = [];
    this.inversePatches = [];
    this.patchListener = patchListener;
  }
};

ImmerScope.prototype.revoke = function revoke$1 () {
  this.leave();
  this.drafts.forEach(revoke);
  this.drafts = null; // Make draft-related methods throw.
};

ImmerScope.prototype.leave = function leave () {
  if (this === ImmerScope.current) {
    ImmerScope.current = this.parent;
  }
};
ImmerScope.current = null;

ImmerScope.enter = function () {
  return this.current = new ImmerScope(this.current);
};

function revoke(draft) {
  draft[DRAFT_STATE].revoke();
}

function willFinalize(scope, result, isReplaced) {
  scope.drafts.forEach(function (draft) {
    draft[DRAFT_STATE].finalizing = true;
  });

  if (!isReplaced) {
    if (scope.patches) {
      markChangesRecursively(scope.drafts[0]);
    } // This is faster when we don't care about which attributes changed.


    markChangesSweep(scope.drafts);
  } // When a child draft is returned, look for changes.
  else if (isDraft(result) && result[DRAFT_STATE].scope === scope) {
      markChangesSweep(scope.drafts);
    }
}
function createProxy(base, parent) {
  var isArray = Array.isArray(base);
  var draft = clonePotentialDraft(base);

  if (isMap(base)) {
    proxyMap(draft);
  } else if (isSet(base)) {
    proxySet(draft);
  } else {
    each(draft, function (prop) {
      proxyProperty(draft, prop, isArray || isEnumerable(base, prop));
    });
  } // See "proxy.js" for property documentation.


  var scope = parent ? parent.scope : ImmerScope.current;
  var state = {
    scope: scope,
    modified: false,
    finalizing: false,
    // es5 only
    finalized: false,
    assigned: isMap(base) ? new Map() : {},
    parent: parent,
    base: base,
    draft: draft,
    drafts: isSet(base) ? new Map() : null,
    copy: null,
    revoke: revoke$1,
    revoked: false // es5 only

  };
  createHiddenProperty(draft, DRAFT_STATE, state);
  scope.drafts.push(draft);
  return draft;
}

function revoke$1() {
  this.revoked = true;
}

function latest$1(state) {
  return state.copy || state.base;
} // Access a property without creating an Immer draft.


function peek(draft, prop) {
  var state = draft[DRAFT_STATE];

  if (state && !state.finalizing) {
    state.finalizing = true;
    var value = draft[prop];
    state.finalizing = false;
    return value;
  }

  return draft[prop];
}

function get$1(state, prop) {
  assertUnrevoked(state);
  var value = peek(latest$1(state), prop);
  if (state.finalizing) { return value; } // Create a draft if the value is unmodified.

  if (value === peek(state.base, prop) && isDraftable(value)) {
    prepareCopy(state);
    return state.copy[prop] = createProxy(value, state);
  }

  return value;
}

function set(state, prop, value) {
  assertUnrevoked(state);
  state.assigned[prop] = true;

  if (!state.modified) {
    if (is(value, peek(latest$1(state), prop))) { return; }
    markChanged(state);
    prepareCopy(state);
  }

  state.copy[prop] = value;
}

function markChanged(state) {
  if (!state.modified) {
    state.modified = true;
    if (state.parent) { markChanged(state.parent); }
  }
}

function prepareCopy(state) {
  if (!state.copy) { state.copy = clonePotentialDraft(state.base); }
}

function clonePotentialDraft(base) {
  var state = base && base[DRAFT_STATE];

  if (state) {
    state.finalizing = true;
    var draft = shallowCopy(state.draft, true);
    state.finalizing = false;
    return draft;
  }

  return shallowCopy(base);
} // property descriptors are recycled to make sure we don't create a get and set closure per property,
// but share them all instead


var descriptors = {};

function proxyProperty(draft, prop, enumerable) {
  var desc = descriptors[prop];

  if (desc) {
    desc.enumerable = enumerable;
  } else {
    descriptors[prop] = desc = {
      configurable: true,
      enumerable: enumerable,

      get: function get$1$1() {
        return get$1(this[DRAFT_STATE], prop);
      },

      set: function set$1(value) {
        set(this[DRAFT_STATE], prop, value);
      }

    };
  }

  Object.defineProperty(draft, prop, desc);
}

function proxyMap(target) {
  Object.defineProperties(target, mapTraps);

  if (hasSymbol) {
    Object.defineProperty(target, Symbol.iterator, proxyMethod(iterateMapValues));
  }
}

var mapTraps = finalizeTraps({
  size: function (state) { return latest$1(state).size; },
  has: function (state) { return function (key) { return latest$1(state).has(key); }; },
  set: function (state) { return function (key, value) {
    if (latest$1(state).get(key) !== value) {
      prepareCopy(state);
      markChanged(state);
      state.assigned.set(key, true);
      state.copy.set(key, value);
    }

    return state.draft;
  }; },
  delete: function (state) { return function (key) {
    prepareCopy(state);
    markChanged(state);
    state.assigned.set(key, false);
    state.copy.delete(key);
    return false;
  }; },
  clear: function (state) { return function () {
    if (!state.copy) {
      prepareCopy(state);
    }

    markChanged(state);
    state.assigned = new Map();

    for (var i = 0, list = latest$1(state).keys(); i < list.length; i += 1) {
      var key = list[i];

      state.assigned.set(key, false);
    }

    return state.copy.clear();
  }; },
  forEach: function (state, key, reciever) { return function (cb) {
    latest$1(state).forEach(function (value, key, map) {
      cb(reciever.get(key), key, map);
    });
  }; },
  get: function (state) { return function (key) {
    var value = latest$1(state).get(key);

    if (state.finalizing || state.finalized || !isDraftable(value)) {
      return value;
    }

    if (value !== state.base.get(key)) {
      return value;
    }

    var draft = createProxy(value, state);
    prepareCopy(state);
    state.copy.set(key, draft);
    return draft;
  }; },
  keys: function (state) { return function () { return latest$1(state).keys(); }; },
  values: iterateMapValues,
  entries: iterateMapValues
});

function proxySet(target) {
  Object.defineProperties(target, setTraps);

  if (hasSymbol) {
    Object.defineProperty(target, Symbol.iterator, proxyMethod(iterateSetValues));
  }
}

var iterateSetValues = makeIterateSetValues(createProxy);
var setTraps = finalizeTraps({
  size: function (state) {
    return latest$1(state).size;
  },
  add: function (state) { return function (value) {
    if (!latest$1(state).has(value)) {
      markChanged(state);

      if (!state.copy) {
        prepareCopy(state);
      }

      state.copy.add(value);
    }

    return state.draft;
  }; },
  delete: function (state) { return function (value) {
    markChanged(state);

    if (!state.copy) {
      prepareCopy(state);
    }

    return state.copy.delete(value);
  }; },
  has: function (state) { return function (key) {
    return latest$1(state).has(key);
  }; },
  clear: function (state) { return function () {
    markChanged(state);

    if (!state.copy) {
      prepareCopy(state);
    }

    return state.copy.clear();
  }; },
  keys: iterateSetValues,
  entries: iterateSetValues,
  values: iterateSetValues,
  forEach: function (state) { return function (cb, thisArg) {
    var iterator = iterateSetValues(state)();
    var result = iterator.next();

    while (!result.done) {
      cb.call(thisArg, result.value, result.value, state.draft);
      result = iterator.next();
    }
  }; }
});

function finalizeTraps(traps) {
  return Object.keys(traps).reduce(function (acc, key) {
    var builder = key === "size" ? proxyAttr : proxyMethod;
    acc[key] = builder(traps[key], key);
    return acc;
  }, {});
}

function proxyAttr(fn) {
  return {
    get: function get() {
      var state = this[DRAFT_STATE];
      assertUnrevoked(state);
      return fn(state);
    }

  };
}

function proxyMethod(trap, key) {
  return {
    get: function get() {
      return function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var state = this[DRAFT_STATE];
        assertUnrevoked(state);
        return trap(state, key, state.draft).apply(void 0, args);
      };
    }

  };
}

function assertUnrevoked(state) {
  if (state.revoked === true) { throw new Error("Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + JSON.stringify(latest$1(state))); }
} // This looks expensive, but only proxies are visited, and only objects without known changes are scanned.


function markChangesSweep(drafts) {
  // The natural order of drafts in the `scope` array is based on when they
  // were accessed. By processing drafts in reverse natural order, we have a
  // better chance of processing leaf nodes first. When a leaf node is known to
  // have changed, we can avoid any traversal of its ancestor nodes.
  for (var i = drafts.length - 1; i >= 0; i--) {
    var state = drafts[i][DRAFT_STATE];

    if (!state.modified) {
      if (Array.isArray(state.base)) {
        if (hasArrayChanges(state)) { markChanged(state); }
      } else if (isMap(state.base)) {
        if (hasMapChanges(state)) { markChanged(state); }
      } else if (isSet(state.base)) {
        if (hasSetChanges(state)) { markChanged(state); }
      } else if (hasObjectChanges(state)) {
        markChanged(state);
      }
    }
  }
}

function markChangesRecursively(object) {
  if (!object || typeof object !== "object") { return; }
  var state = object[DRAFT_STATE];
  if (!state) { return; }
  var base = state.base;
  var draft = state.draft;
  var assigned = state.assigned;

  if (!Array.isArray(object)) {
    // Look for added keys.
    Object.keys(draft).forEach(function (key) {
      // The `undefined` check is a fast path for pre-existing keys.
      if (base[key] === undefined && !has(base, key)) {
        assigned[key] = true;
        markChanged(state);
      } else if (!assigned[key]) {
        // Only untouched properties trigger recursion.
        markChangesRecursively(draft[key]);
      }
    }); // Look for removed keys.

    Object.keys(base).forEach(function (key) {
      // The `undefined` check is a fast path for pre-existing keys.
      if (draft[key] === undefined && !has(draft, key)) {
        assigned[key] = false;
        markChanged(state);
      }
    });
  } else if (hasArrayChanges(state)) {
    markChanged(state);
    assigned.length = true;

    if (draft.length < base.length) {
      for (var i = draft.length; i < base.length; i++) { assigned[i] = false; }
    } else {
      for (var i$1 = base.length; i$1 < draft.length; i$1++) { assigned[i$1] = true; }
    }

    for (var i$2 = 0; i$2 < draft.length; i$2++) {
      // Only untouched indices trigger recursion.
      if (assigned[i$2] === undefined) { markChangesRecursively(draft[i$2]); }
    }
  }
}

function hasObjectChanges(state) {
  var base = state.base;
  var draft = state.draft; // Search for added keys and changed keys. Start at the back, because
  // non-numeric keys are ordered by time of definition on the object.

  var keys = Object.keys(draft);

  for (var i = keys.length - 1; i >= 0; i--) {
    var key = keys[i];
    var baseValue = base[key]; // The `undefined` check is a fast path for pre-existing keys.

    if (baseValue === undefined && !has(base, key)) {
      return true;
    } // Once a base key is deleted, future changes go undetected, because its
    // descriptor is erased. This branch detects any missed changes.
    else {
        var value = draft[key];
        var state$1 = value && value[DRAFT_STATE];

        if (state$1 ? state$1.base !== baseValue : !is(value, baseValue)) {
          return true;
        }
      }
  } // At this point, no keys were added or changed.
  // Compare key count to determine if keys were deleted.


  return keys.length !== Object.keys(base).length;
}

function hasArrayChanges(state) {
  var draft = state.draft;
  if (draft.length !== state.base.length) { return true; } // See #116
  // If we first shorten the length, our array interceptors will be removed.
  // If after that new items are added, result in the same original length,
  // those last items will have no intercepting property.
  // So if there is no own descriptor on the last position, we know that items were removed and added
  // N.B.: splice, unshift, etc only shift values around, but not prop descriptors, so we only have to check
  // the last one

  var descriptor = Object.getOwnPropertyDescriptor(draft, draft.length - 1); // descriptor can be null, but only for newly created sparse arrays, eg. new Array(10)

  if (descriptor && !descriptor.get) { return true; } // For all other cases, we don't have to compare, as they would have been picked up by the index setters

  return false;
}

function hasMapChanges(state) {
  var base = state.base;
  var draft = state.draft;
  if (base.size !== draft.size) { return true; } // IE11 supports only forEach iteration

  var hasChanges = false;
  draft.forEach(function (value, key) {
    if (!hasChanges) {
      hasChanges = isDraftable(value) ? value.modified : value !== base.get(key);
    }
  });
  return hasChanges;
}

function hasSetChanges(state) {
  var base = state.base;
  var draft = state.draft;
  if (base.size !== draft.size) { return true; } // IE11 supports only forEach iteration

  var hasChanges = false;
  draft.forEach(function (value, key) {
    if (!hasChanges) {
      hasChanges = isDraftable(value) ? value.modified : !base.has(key);
    }
  });
  return hasChanges;
}

function createHiddenProperty(target, prop, value) {
  Object.defineProperty(target, prop, {
    value: value,
    enumerable: false,
    writable: true
  });
}

var legacyProxy = /*#__PURE__*/Object.freeze({
	willFinalize: willFinalize,
	createProxy: createProxy
});

var obj$1, obj$1$1;

function willFinalize$1() {}
/**
 * Returns a new draft of the `base` object.
 *
 * The second argument is the parent draft-state (used internally).
 */

function createProxy$1(base, parent) {
  var scope = parent ? parent.scope : ImmerScope.current;
  var state = {
    // Track which produce call this is associated with.
    scope: scope,
    // True for both shallow and deep changes.
    modified: false,
    // Used during finalization.
    finalized: false,
    // Track which properties have been assigned (true) or deleted (false).
    assigned: {},
    // The parent draft state.
    parent: parent,
    // The base state.
    base: base,
    // The base proxy.
    draft: null,
    // Any property proxies.
    drafts: {},
    // The base copy with any updated values.
    copy: null,
    // Called by the `produce` function.
    revoke: null
  };
  var target = state;
  var traps = objectTraps;

  if (Array.isArray(base)) {
    target = [state];
    traps = arrayTraps;
  } // Map drafts must support object keys, so we use Map objects to track changes.
  else if (isMap(base)) {
      traps = mapTraps$1;
      state.drafts = new Map();
      state.assigned = new Map();
    } // Set drafts use a Map object to track which of its values are drafted.
    // And we don't need the "assigned" property, because Set objects have no keys.
    else if (isSet(base)) {
        traps = setTraps$1;
        state.drafts = new Map();
      }

  var ref = Proxy.revocable(target, traps);
  var revoke = ref.revoke;
  var proxy = ref.proxy;
  state.draft = proxy;
  state.revoke = revoke;
  scope.drafts.push(proxy);
  return proxy;
}
/**
 * Object drafts
 */

var objectTraps = {
  get: function get(state, prop) {
    if (prop === DRAFT_STATE) { return state; }
    var drafts = state.drafts; // Check for existing draft in unmodified state.

    if (!state.modified && has(drafts, prop)) {
      return drafts[prop];
    }

    var value = latest$2(state)[prop];

    if (state.finalized || !isDraftable(value)) {
      return value;
    } // Check for existing draft in modified state.


    if (state.modified) {
      // Assigned values are never drafted. This catches any drafts we created, too.
      if (value !== peek$1(state.base, prop)) { return value; } // Store drafts on the copy (when one exists).

      drafts = state.copy;
    }

    return drafts[prop] = createProxy$1(value, state);
  },

  has: function has(state, prop) {
    return prop in latest$2(state);
  },

  ownKeys: function ownKeys(state) {
    return Reflect.ownKeys(latest$2(state));
  },

  set: function set(state, prop, value) {
    if (!state.modified) {
      var baseValue = peek$1(state.base, prop); // Optimize based on value's truthiness. Truthy values are guaranteed to
      // never be undefined, so we can avoid the `in` operator. Lastly, truthy
      // values may be drafts, but falsy values are never drafts.

      var isUnchanged = value ? is(baseValue, value) || value === state.drafts[prop] : is(baseValue, value) && prop in state.base;
      if (isUnchanged) { return true; }
      markChanged$1(state);
    }

    state.assigned[prop] = true;
    state.copy[prop] = value;
    return true;
  },

  deleteProperty: function deleteProperty(state, prop) {
    // The `undefined` check is a fast path for pre-existing keys.
    if (peek$1(state.base, prop) !== undefined || prop in state.base) {
      state.assigned[prop] = false;
      markChanged$1(state);
    } else if (state.assigned[prop]) {
      // if an originally not assigned property was deleted
      delete state.assigned[prop];
    }

    if (state.copy) { delete state.copy[prop]; }
    return true;
  },

  // Note: We never coerce `desc.value` into an Immer draft, because we can't make
  // the same guarantee in ES5 mode.
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(state, prop) {
    var owner = latest$2(state);
    var desc = Reflect.getOwnPropertyDescriptor(owner, prop);

    if (desc) {
      desc.writable = true;
      desc.configurable = !Array.isArray(owner) || prop !== "length";
    }

    return desc;
  },

  defineProperty: function defineProperty() {
    throw new Error("Object.defineProperty() cannot be used on an Immer draft"); // prettier-ignore
  },

  getPrototypeOf: function getPrototypeOf(state) {
    return Object.getPrototypeOf(state.base);
  },

  setPrototypeOf: function setPrototypeOf() {
    throw new Error("Object.setPrototypeOf() cannot be used on an Immer draft"); // prettier-ignore
  }

};
/**
 * Array drafts
 */

var arrayTraps = {};
each(objectTraps, function (key, fn) {
  arrayTraps[key] = function () {
    arguments[0] = arguments[0][0];
    return fn.apply(this, arguments);
  };
});

arrayTraps.deleteProperty = function (state, prop) {
  if (isNaN(parseInt(prop))) {
    throw new Error("Immer only supports deleting array indices"); // prettier-ignore
  }

  return objectTraps.deleteProperty.call(this, state[0], prop);
};

arrayTraps.set = function (state, prop, value) {
  if (prop !== "length" && isNaN(parseInt(prop))) {
    throw new Error("Immer only supports setting array indices and the 'length' property"); // prettier-ignore
  }

  return objectTraps.set.call(this, state[0], prop, value);
}; // Used by Map and Set drafts


var reflectTraps = makeReflectTraps(["ownKeys", "has", "set", "deleteProperty", "defineProperty", "getOwnPropertyDescriptor", "preventExtensions", "isExtensible", "getPrototypeOf"]);
/**
 * Map drafts
 */

var mapTraps$1 = makeTrapsForGetters(( obj$1 = {}, obj$1[DRAFT_STATE] = function (state) { return state; }, obj$1.size = function (state) { return latest$2(state).size; }, obj$1.has = function (state) { return function (key) { return latest$2(state).has(key); }; }, obj$1.set = function (state) { return function (key, value) {
    var values = latest$2(state);

    if (!values.has(key) || values.get(key) !== value) {
      markChanged$1(state);
      state.assigned.set(key, true);
      state.copy.set(key, value);
    }

    return state.draft;
  }; }, obj$1.delete = function (state) { return function (key) {
    if (latest$2(state).has(key)) {
      markChanged$1(state);
      state.assigned.set(key, false);
      return state.copy.delete(key);
    }

    return false;
  }; }, obj$1.clear = function (state) { return function () {
    markChanged$1(state);
    state.assigned = new Map();

    for (var i = 0, list = latest$2(state).keys(); i < list.length; i += 1) {
      var key = list[i];

      state.assigned.set(key, false);
    }

    return state.copy.clear();
  }; }, obj$1.forEach = function (state, _, receiver) { return function (cb, thisArg) { return latest$2(state).forEach(function (_, key, map) {
    var value = receiver.get(key);
    cb.call(thisArg, value, key, map);
  }); }; }, obj$1.get = function (state) { return function (key) {
    var drafts = state[state.modified ? "copy" : "drafts"];

    if (drafts.has(key)) {
      return drafts.get(key);
    }

    var value = latest$2(state).get(key);

    if (state.finalized || !isDraftable(value)) {
      return value;
    }

    var draft = createProxy$1(value, state);
    drafts.set(key, draft);
    return draft;
  }; }, obj$1.keys = function (state) { return function () { return latest$2(state).keys(); }; }, obj$1.values = iterateMapValues, obj$1.entries = iterateMapValues, obj$1[hasSymbol ? Symbol.iterator : "@@iterator"] = iterateMapValues, obj$1 ));
var iterateSetValues$1 = makeIterateSetValues(createProxy$1);
/**
 * Set drafts
 */

var setTraps$1 = makeTrapsForGetters(( obj$1$1 = {}, obj$1$1[DRAFT_STATE] = function (state) { return state; }, obj$1$1.size = function (state) { return latest$2(state).size; }, obj$1$1.has = function (state) { return function (key) { return latest$2(state).has(key); }; }, obj$1$1.add = function (state) { return function (value) {
    if (!latest$2(state).has(value)) {
      markChanged$1(state);
      state.copy.add(value);
    }

    return state.draft;
  }; }, obj$1$1.delete = function (state) { return function (value) {
    markChanged$1(state);
    return state.copy.delete(value);
  }; }, obj$1$1.clear = function (state) { return function () {
    markChanged$1(state);
    return state.copy.clear();
  }; }, obj$1$1.forEach = function (state) { return function (cb, thisArg) {
    var iterator = iterateSetValues$1(state)();
    var result = iterator.next();

    while (!result.done) {
      cb.call(thisArg, result.value, result.value, state.draft);
      result = iterator.next();
    }
  }; }, obj$1$1.keys = iterateSetValues$1, obj$1$1.values = iterateSetValues$1, obj$1$1.entries = iterateSetValues$1, obj$1$1[hasSymbol ? Symbol.iterator : "@@iterator"] = iterateSetValues$1, obj$1$1 ));
/**
 * Helpers
 */
// Retrieve the latest values of the draft.

function latest$2(state) {
  return state.copy || state.base;
} // Access a property without creating an Immer draft.


function peek$1(draft, prop) {
  var state = draft[DRAFT_STATE];
  var desc = Reflect.getOwnPropertyDescriptor(state ? latest$2(state) : draft, prop);
  return desc && desc.value;
}

function markChanged$1(state) {
  if (!state.modified) {
    state.modified = true;
    var base = state.base;
    var drafts = state.drafts;
    var parent = state.parent;
    var copy = shallowCopy(base);

    if (isSet(base)) {
      // Note: The `drafts` property is preserved for Set objects, since
      // we need to keep track of which values are drafted.
      assignSet(copy, drafts);
    } else {
      // Merge nested drafts into the copy.
      if (isMap(base)) { assignMap(copy, drafts); }else { assign(copy, drafts); }
      state.drafts = null;
    }

    state.copy = copy;

    if (parent) {
      markChanged$1(parent);
    }
  }
}
/** Create traps that all use the `Reflect` API on the `latest(state)` */


function makeReflectTraps(names) {
  return names.reduce(function (traps, name) {
    traps[name] = function (state) {
      var args = [], len = arguments.length - 1;
      while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

      return Reflect[name].apply(Reflect, [ latest$2(state) ].concat( args ));
    };

    return traps;
  }, {});
}

function makeTrapsForGetters(getters) {
  return Object.assign({}, reflectTraps, {
    get: function get(state, prop, receiver) {
      return getters.hasOwnProperty(prop) ? getters[prop](state, prop, receiver) : Reflect.get(state, prop, receiver);
    },

    setPrototypeOf: function setPrototypeOf(state) {
      throw new Error("Object.setPrototypeOf() cannot be used on an Immer draft"); // prettier-ignore
    }

  });
}

var modernProxy = /*#__PURE__*/Object.freeze({
	willFinalize: willFinalize$1,
	createProxy: createProxy$1
});

function generatePatches(state, basePath, patches, inversePatches) {
  var generatePatchesFn = Array.isArray(state.base) ? generateArrayPatches : isSet(state.base) ? generateSetPatches : generatePatchesFromAssigned;
  generatePatchesFn(state, basePath, patches, inversePatches);
}

function generateArrayPatches(state, basePath, patches, inversePatches) {
  var assign, assign$1;

  var base = state.base;
  var copy = state.copy;
  var assigned = state.assigned; // Reduce complexity by ensuring `base` is never longer.

  if (copy.length < base.length) {
    (assign = [copy, base], base = assign[0], copy = assign[1]);
    (assign$1 = [inversePatches, patches], patches = assign$1[0], inversePatches = assign$1[1]);
  }

  var delta = copy.length - base.length; // Find the first replaced index.

  var start = 0;

  while (base[start] === copy[start] && start < base.length) {
    ++start;
  } // Find the last replaced index. Search from the end to optimize splice patches.


  var end = base.length;

  while (end > start && base[end - 1] === copy[end + delta - 1]) {
    --end;
  } // Process replaced indices.


  for (var i = start; i < end; ++i) {
    if (assigned[i] && copy[i] !== base[i]) {
      var path = basePath.concat([i]);
      patches.push({
        op: "replace",
        path: path,
        value: copy[i]
      });
      inversePatches.push({
        op: "replace",
        path: path,
        value: base[i]
      });
    }
  }

  var replaceCount = patches.length; // Process added indices.

  for (var i$1 = end + delta - 1; i$1 >= end; --i$1) {
    var path$1 = basePath.concat([i$1]);
    patches[replaceCount + i$1 - end] = {
      op: "add",
      path: path$1,
      value: copy[i$1]
    };
    inversePatches.push({
      op: "remove",
      path: path$1
    });
  }
} // This is used for both Map objects and normal objects.


function generatePatchesFromAssigned(state, basePath, patches, inversePatches) {
  var base = state.base;
  var copy = state.copy;
  each(state.assigned, function (key, assignedValue) {
    var origValue = get(base, key);
    var value = get(copy, key);
    var op = !assignedValue ? "remove" : has(base, key) ? "replace" : "add";
    if (origValue === value && op === "replace") { return; }
    var path = basePath.concat(key);
    patches.push(op === "remove" ? {
      op: op,
      path: path
    } : {
      op: op,
      path: path,
      value: value
    });
    inversePatches.push(op === "add" ? {
      op: "remove",
      path: path
    } : op === "remove" ? {
      op: "add",
      path: path,
      value: origValue
    } : {
      op: "replace",
      path: path,
      value: origValue
    });
  });
}

function generateSetPatches(state, basePath, patches, inversePatches) {
  var base = state.base;
  var copy = state.copy;
  var i = 0;

  for (var i$1 = 0, list = base; i$1 < list.length; i$1 += 1) {
    var value = list[i$1];

    if (!copy.has(value)) {
      var path = basePath.concat([i]);
      patches.push({
        op: "remove",
        path: path,
        value: value
      });
      inversePatches.unshift({
        op: "add",
        path: path,
        value: value
      });
    }

    i++;
  }

  i = 0;

  for (var i$2 = 0, list$1 = copy; i$2 < list$1.length; i$2 += 1) {
    var value$1 = list$1[i$2];

    if (!base.has(value$1)) {
      var path$1 = basePath.concat([i]);
      patches.push({
        op: "add",
        path: path$1,
        value: value$1
      });
      inversePatches.unshift({
        op: "remove",
        path: path$1,
        value: value$1
      });
    }

    i++;
  }
}

var applyPatches = function (draft, patches) {
  for (var i$1 = 0, list = patches; i$1 < list.length; i$1 += 1) {
    var patch = list[i$1];

    var path = patch.path;
    var op = patch.op;
    if (!path.length) { throw new Error("Illegal state"); }
    var base = draft;

    for (var i = 0; i < path.length - 1; i++) {
      base = get(base, path[i]);
      if (!base || typeof base !== "object") { throw new Error("Cannot apply patch, path doesn't resolve: " + path.join("/")); } // prettier-ignore
    }

    var value = clone(patch.value); // used to clone patch to ensure original patch is not modified, see #411

    var key = path[path.length - 1];

    switch (op) {
      case "replace":
        if (isMap(base)) {
          base.set(key, value);
        } else if (isSet(base)) {
          throw new Error('Sets cannot have "replace" patches.');
        } else {
          // if value is an object, then it's assigned by reference
          // in the following add or remove ops, the value field inside the patch will also be modifyed
          // so we use value from the cloned patch
          base[key] = value;
        }

        break;

      case "add":
        if (isSet(base)) {
          base.delete(patch.value);
        }

        Array.isArray(base) ? base.splice(key, 0, value) : isMap(base) ? base.set(key, value) : isSet(base) ? base.add(value) : base[key] = value;
        break;

      case "remove":
        Array.isArray(base) ? base.splice(key, 1) : isMap(base) ? base.delete(key) : isSet(base) ? base.delete(patch.value) : delete base[key];
        break;

      default:
        throw new Error("Unsupported patch operation: " + op);
    }
  }

  return draft;
};

function verifyMinified() {}

var configDefaults = {
  useProxies: typeof Proxy !== "undefined" && typeof Proxy.revocable !== "undefined" && typeof Reflect !== "undefined",
  autoFreeze: typeof process !== "undefined" ? process.env.NODE_ENV !== "production" : verifyMinified.name === "verifyMinified",
  onAssign: null,
  onDelete: null,
  onCopy: null
};
var Immer = function Immer(config) {
  assign(this, configDefaults, config);
  this.setUseProxies(this.useProxies);
  this.produce = this.produce.bind(this);
  this.produceWithPatches = this.produceWithPatches.bind(this);
};

Immer.prototype.produce = function produce (base, recipe, patchListener) {
    var this$1 = this;

  // curried invocation
  if (typeof base === "function" && typeof recipe !== "function") {
    var defaultBase = recipe;
    recipe = base;
    var self = this;
    return function curriedProduce(base) {
        var this$1 = this;
        if ( base === void 0 ) base = defaultBase;
        var args = [], len = arguments.length - 1;
        while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

      return self.produce(base, function (draft) { return recipe.call.apply(recipe, [ this$1, draft ].concat( args )); }); // prettier-ignore
    };
  } // prettier-ignore


  {
    if (typeof recipe !== "function") {
      throw new Error("The first or second argument to `produce` must be a function");
    }

    if (patchListener !== undefined && typeof patchListener !== "function") {
      throw new Error("The third argument to `produce` must be a function or undefined");
    }
  }
  var result; // Only plain objects, arrays, and "immerable classes" are drafted.

  if (isDraftable(base)) {
    var scope = ImmerScope.enter();
    var proxy = this.createProxy(base);
    var hasError = true;

    try {
      result = recipe(proxy);
      hasError = false;
    } finally {
      // finally instead of catch + rethrow better preserves original stack
      if (hasError) { scope.revoke(); }else { scope.leave(); }
    }

    if (typeof Promise !== "undefined" && result instanceof Promise) {
      return result.then(function (result) {
        scope.usePatches(patchListener);
        return this$1.processResult(result, scope);
      }, function (error) {
        scope.revoke();
        throw error;
      });
    }

    scope.usePatches(patchListener);
    return this.processResult(result, scope);
  } else {
    result = recipe(base);
    if (result === NOTHING) { return undefined; }
    if (result === undefined) { result = base; }
    this.maybeFreeze(result, true);
    return result;
  }
};

Immer.prototype.produceWithPatches = function produceWithPatches (arg1, arg2, arg3) {
    var this$1 = this;

  if (typeof arg1 === "function") {
    return function (state) {
        var args = [], len = arguments.length - 1;
        while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

        return this$1.produceWithPatches(state, function (draft) { return arg1.apply(void 0, [ draft ].concat( args )); });
      };
  } // non-curried form


  if (arg3) { throw new Error("A patch listener cannot be passed to produceWithPatches"); }
  var patches, inversePatches;
  var nextState = this.produce(arg1, arg2, function (p, ip) {
    patches = p;
    inversePatches = ip;
  });
  return [nextState, patches, inversePatches];
};

Immer.prototype.createDraft = function createDraft (base) {
  if (!isDraftable(base)) {
    throw new Error("First argument to `createDraft` must be a plain object, an array, or an immerable object"); // prettier-ignore
  }

  var scope = ImmerScope.enter();
  var proxy = this.createProxy(base);
  proxy[DRAFT_STATE].isManual = true;
  scope.leave();
  return proxy;
};

Immer.prototype.finishDraft = function finishDraft (draft, patchListener) {
  var state = draft && draft[DRAFT_STATE];

  if (!state || !state.isManual) {
    throw new Error("First argument to `finishDraft` must be a draft returned by `createDraft`"); // prettier-ignore
  }

  if (state.finalized) {
    throw new Error("The given draft is already finalized"); // prettier-ignore
  }

  var scope = state.scope;
  scope.usePatches(patchListener);
  return this.processResult(undefined, scope);
};

Immer.prototype.setAutoFreeze = function setAutoFreeze (value) {
  this.autoFreeze = value;
};

Immer.prototype.setUseProxies = function setUseProxies (value) {
  this.useProxies = value;
  assign(this, value ? modernProxy : legacyProxy);
};

Immer.prototype.applyPatches = function applyPatches$1 (base, patches) {
  // If a patch replaces the entire state, take that replacement as base
  // before applying patches
  var i;

  for (i = patches.length - 1; i >= 0; i--) {
    var patch = patches[i];

    if (patch.path.length === 0 && patch.op === "replace") {
      base = patch.value;
      break;
    }
  }

  if (isDraft(base)) {
    // N.B: never hits if some patch a replacement, patches are never drafts
    return applyPatches(base, patches);
  } // Otherwise, produce a copy of the base state.


  return this.produce(base, function (draft) { return applyPatches(draft, patches.slice(i + 1)); });
};
/** @internal */


Immer.prototype.processResult = function processResult (result, scope) {
  var baseDraft = scope.drafts[0];
  var isReplaced = result !== undefined && result !== baseDraft;
  this.willFinalize(scope, result, isReplaced);

  if (isReplaced) {
    if (baseDraft[DRAFT_STATE].modified) {
      scope.revoke();
      throw new Error("An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft."); // prettier-ignore
    }

    if (isDraftable(result)) {
      // Finalize the result in case it contains (or is) a subset of the draft.
      result = this.finalize(result, null, scope);
      this.maybeFreeze(result);
    }

    if (scope.patches) {
      scope.patches.push({
        op: "replace",
        path: [],
        value: result
      });
      scope.inversePatches.push({
        op: "replace",
        path: [],
        value: baseDraft[DRAFT_STATE].base
      });
    }
  } else {
    // Finalize the base draft.
    result = this.finalize(baseDraft, [], scope);
  }

  scope.revoke();

  if (scope.patches) {
    scope.patchListener(scope.patches, scope.inversePatches);
  }

  return result !== NOTHING ? result : undefined;
};
/**
 * @internal
 * Finalize a draft, returning either the unmodified base state or a modified
 * copy of the base state.
 */


Immer.prototype.finalize = function finalize (draft, path, scope) {
    var this$1 = this;

  var state = draft[DRAFT_STATE];

  if (!state) {
    if (Object.isFrozen(draft)) { return draft; }
    return this.finalizeTree(draft, null, scope);
  } // Never finalize drafts owned by another scope.


  if (state.scope !== scope) {
    return draft;
  }

  if (!state.modified) {
    this.maybeFreeze(state.base, true);
    return state.base;
  }

  if (!state.finalized) {
    state.finalized = true;
    this.finalizeTree(state.draft, path, scope); // We cannot really delete anything inside of a Set. We can only replace the whole Set.

    if (this.onDelete && !isSet(state.base)) {
      // The `assigned` object is unreliable with ES5 drafts.
      if (this.useProxies) {
        var assigned = state.assigned;
        each(assigned, function (prop, exists) {
          if (!exists) { this$1.onDelete(state, prop); }
        });
      } else {
        // TODO: Figure it out for Maps and Sets if we need to support ES5
        var base = state.base;
          var copy = state.copy;
        each(base, function (prop) {
          if (!has(copy, prop)) { this$1.onDelete(state, prop); }
        });
      }
    }

    if (this.onCopy) {
      this.onCopy(state);
    } // At this point, all descendants of `state.copy` have been finalized,
    // so we can be sure that `scope.canAutoFreeze` is accurate.


    if (this.autoFreeze && scope.canAutoFreeze) {
      freeze(state.copy, false);
    }

    if (path && scope.patches) {
      generatePatches(state, path, scope.patches, scope.inversePatches);
    }
  }

  return state.copy;
};
/**
 * @internal
 * Finalize all drafts in the given state tree.
 */


Immer.prototype.finalizeTree = function finalizeTree (root, rootPath, scope) {
    var this$1 = this;

  var state = root[DRAFT_STATE];

  if (state) {
    if (!this.useProxies) {
      // Create the final copy, with added keys and without deleted keys.
      state.copy = shallowCopy(state.draft, true);
    }

    root = state.copy;
  }

  var needPatches = !!rootPath && !!scope.patches;

  var finalizeProperty = function (prop, value, parent) {
    if (value === parent) {
      throw Error("Immer forbids circular references");
    } // In the `finalizeTree` method, only the `root` object may be a draft.


    var isDraftProp = !!state && parent === root;
    var isSetMember = isSet(parent);

    if (isDraft(value)) {
      var path = isDraftProp && needPatches && !isSetMember && // Set objects are atomic since they have no keys.
      !has(state.assigned, prop) // Skip deep patches for assigned keys.
      ? rootPath.concat(prop) : null; // Drafts owned by `scope` are finalized here.

      value = this$1.finalize(value, path, scope);
      replace(parent, prop, value); // Drafts from another scope must prevent auto-freezing.

      if (isDraft(value)) {
        scope.canAutoFreeze = false;
      } // Unchanged drafts are never passed to the `onAssign` hook.


      if (isDraftProp && value === get(state.base, prop)) { return; }
    } // Unchanged draft properties are ignored.
    else if (isDraftProp && is(value, get(state.base, prop))) {
        return;
      } // Search new objects for unfinalized drafts. Frozen objects should never contain drafts.
      else if (isDraftable(value) && !Object.isFrozen(value)) {
          each(value, finalizeProperty);
          this$1.maybeFreeze(value);
        }

    if (isDraftProp && this$1.onAssign && !isSetMember) {
      this$1.onAssign(state, prop, value);
    }
  };

  each(root, finalizeProperty);
  return root;
};

Immer.prototype.maybeFreeze = function maybeFreeze (value, deep) {
    if ( deep === void 0 ) deep = false;

  if (this.autoFreeze && !isDraft(value)) {
    freeze(value, deep);
  }
};

function replace(parent, prop, value) {
  if (isMap(parent)) {
    parent.set(prop, value);
  } else if (isSet(parent)) {
    // In this case, the `prop` is actually a draft.
    parent.delete(prop);
    parent.add(value);
  } else if (Array.isArray(parent) || isEnumerable(parent, prop)) {
    // Preserve non-enumerable properties.
    parent[prop] = value;
  } else {
    Object.defineProperty(parent, prop, {
      value: value,
      writable: true,
      configurable: true
    });
  }
}

var immer = new Immer();
/**
 * The `produce` function takes a value and a "recipe function" (whose
 * return value often depends on the base state). The recipe function is
 * free to mutate its first argument however it wants. All mutations are
 * only ever applied to a __copy__ of the base state.
 *
 * Pass only a function to create a "curried producer" which relieves you
 * from passing the recipe function every time.
 *
 * Only plain objects and arrays are made mutable. All other objects are
 * considered uncopyable.
 *
 * Note: This function is __bound__ to its `Immer` instance.
 *
 * @param {any} base - the initial state
 * @param {Function} producer - function that receives a proxy of the base state as first argument and which can be freely modified
 * @param {Function} patchListener - optional function that will be called with all the patches produced here
 * @returns {any} a new state, or the initial state if nothing was modified
 */

var produce = immer.produce;
/**
 * Like `produce`, but `produceWithPatches` always returns a tuple
 * [nextState, patches, inversePatches] (instead of just the next state)
 */

var produceWithPatches = immer.produceWithPatches.bind(immer);
/**
 * Pass true to automatically freeze all copies created by Immer.
 *
 * By default, auto-freezing is disabled in production.
 */

var setAutoFreeze = immer.setAutoFreeze.bind(immer);
/**
 * Pass true to use the ES2015 `Proxy` class when creating drafts, which is
 * always faster than using ES5 proxies.
 *
 * By default, feature detection is used, so calling this is rarely necessary.
 */

var setUseProxies = immer.setUseProxies.bind(immer);
/**
 * Apply an array of Immer patches to the first argument.
 *
 * This function is a producer, which means copy-on-write is in effect.
 */

var applyPatches$1 = immer.applyPatches.bind(immer);
/**
 * Create an Immer draft from the given base state, which may be a draft itself.
 * The draft can be modified until you finalize it with the `finishDraft` function.
 */

var createDraft = immer.createDraft.bind(immer);
/**
 * Finalize an Immer draft from a `createDraft` call, returning the base state
 * (if no changes were made) or a modified copy. The draft must *not* be
 * mutated afterwards.
 *
 * Pass a function as the 2nd argument to generate Immer patches based on the
 * changes that were made.
 */

var finishDraft = immer.finishDraft.bind(immer);

export default produce;
export { Immer, applyPatches$1 as applyPatches, createDraft, finishDraft, DRAFTABLE as immerable, isDraft, isDraftable, NOTHING as nothing, original, produce, produceWithPatches, setAutoFreeze, setUseProxies };
//# sourceMappingURL=immer.module.js.map

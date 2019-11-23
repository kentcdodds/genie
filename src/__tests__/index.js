import genie from '../'

beforeEach(prepForTest)

describe('#', () => {
  beforeEach(prepForTest)
  test('should register with an object', () => {
    genie({
      magicWords: 'magicWord',
      action() {},
    })
    const wishData = {
      name: 'value',
    }
    const maximalObject = genie({
      id: 'coolId',
      context: ['gandpa', 'child', 'grandchild'],
      data: wishData,
      magicWords: ['magic', 'word'],
      action() {},
    })
    const allWishes = genie.getMatchingWishes()
    expect(allWishes).toHaveLength(2)
    expect(maximalObject.id).toBe('coolId')
    expect(maximalObject.context.any).toHaveLength(3)
    expect(maximalObject.data).toBe(wishData)
    expect(maximalObject.magicWords).toHaveLength(2)
  })

  test('should register with an array', () => {
    genie([
      {
        magicWords: 'wish1',
        action() {},
      },
      {
        magicWords: 'wish2',
        action() {},
      },
      {
        magicWords: 'wish3',
        action() {},
      },
    ])

    const allWishes = genie.getMatchingWishes()
    expect(allWishes).toHaveLength(3)
  })

  test('should overwrite wish with duplicateId', () => {
    const wishOne = genie(
      fillInWish({
        id: 'id',
      }),
    )
    const wishTwo = genie(
      fillInWish({
        id: 'id',
      }),
    )
    const allWishes = genie.getMatchingWishes()
    expect(allWishes).toHaveLength(1)
    expect(wishTwo).toBe(allWishes[0])
    expect(wishOne).not.toBe(allWishes[0])
  })

  test('should not have any wishes registered prior to registration', () => {
    const allWishes = genie.getMatchingWishes()
    expect(allWishes).toHaveLength(0)
  })

  test('should have one wish registered upon registration and zero upon deregistration', () => {
    const wish = genie(fillInWish())
    let allWishes = genie.getMatchingWishes()
    expect(allWishes).toHaveLength(1)
    genie.deregisterWish(wish)
    allWishes = genie.getMatchingWishes()
    expect(allWishes).toHaveLength(0)
  })

  test('should make the last wish registered without giving magic words', () => {
    genie(fillInWish())
    const wishToBeMade = genie(fillInWish())
    const allWishes = genie.getMatchingWishes()
    expect(allWishes).toHaveLength(2)
    const madeWish = genie.makeWish()
    expect(wishToBeMade.data.timesMade.total).toBe(1)
    expect(madeWish).toBe(wishToBeMade)
  })

  test('should return empty object and not register a wish when genie is disabled', () => {
    genie.enabled(false)
    const emptyObject = genie(fillInWish())
    expect(Object.keys(emptyObject)).toHaveLength(0)
    let allWishes = genie.getMatchingWishes()
    expect(allWishes).toHaveLength(0)

    genie.enabled(true)
    genie.returnOnDisabled(false)
    genie.enabled(false)
    const nullObject = genie(fillInWish())

    expect(nullObject).toBeNull()
    allWishes = genie.getMatchingWishes()
    expect(allWishes).toBeNull()
  })

  describe('special wish types', () => {
    describe('navigation wish type', () => {
      test('should navigate when a wish is made whose action is a string', () => {
        const destination = `${window.location.href}#success`
        const moveToSuccess = genie({
          magicWords: 'Add success hash',
          action: destination,
        })
        genie.makeWish(moveToSuccess)
        expect(window.location.href).toBe(destination)
        // Cannot really test the new tab action, but if I could, it would look like this:
        // wish = genie({
        //   magicWords: 'Open GenieJS repo',
        //   action: {
        //     destination: 'http://www.github.com/kentcdodds/genie',
        //     openNewTab: true
        //   }
        // });
        // genie.makeWish(wish);
      })
    })
  })
})

describe('#reset', () => {
  beforeEach(prepForTest)
  test('should reset all options', () => {
    const originalOptions = genie.options()

    const wish = genie(fillInWish())
    genie.makeWish(wish)

    expect(genie.options()).not.toBe(originalOptions)
    genie.reset()
  })
})

// End registration

describe('#deregisterWish #deregisterWishesWithContex', () => {
  beforeEach(prepForTest)
  const allWishCount = 5
  let wish1, allWishes
  beforeEach(done => {
    wish1 = genie(fillInWish())
    genie(
      fillInWish({
        context: 'context1',
      }),
    )
    genie(
      fillInWish({
        context: 'context1',
      }),
    )
    genie(
      fillInWish({
        context: 'context2',
      }),
    )
    genie(
      fillInWish({
        context: 'context2',
      }),
    )
    done()
  })
  test('should have one less wish when a wish is deregistered', () => {
    allWishes = genie.getMatchingWishes()
    expect(allWishes).toHaveLength(allWishCount)
    genie.deregisterWish(wish1)

    allWishes = genie.getMatchingWishes()
    expect(allWishes).toHaveLength(allWishCount - 1)
  })

  test('should remove only wishes in a given context (excluding the default context) when deregisterWishesWithContext is called', () => {
    allWishes = genie.getMatchingWishes()
    expect(allWishes).toHaveLength(allWishCount)
    genie.deregisterWishesWithContext('context1')

    allWishes = genie.getMatchingWishes()
    expect(allWishes).toHaveLength(allWishCount - 2)
  })
})
// End #deregisterWish #deregisterWishesWithContex

describe('#context #addContext #removeContext', () => {
  beforeEach(prepForTest)
  let defaultContextWish, complexContextNone
  beforeEach(done => {
    defaultContextWish = genie(fillInWish())
    genie(
      fillInWish({
        context: 'context1',
      }),
    )
    genie(
      fillInWish({
        context: 'context2',
      }),
    )
    genie(
      fillInWish({
        context: ['context3'],
      }),
    )
    genie(
      fillInWish({
        context: ['context1', 'context2', 'context3'],
      }),
    )
    genie(
      fillInWish({
        context: {
          all: ['context1', 'context2', 'context3'],
        },
      }),
    )
    genie(
      fillInWish({
        context: {
          any: ['context1', 'context3', 'context5'],
        },
      }),
    )
    complexContextNone = genie(
      fillInWish({
        context: {
          none: ['context1', 'context2'],
        },
      }),
    )
    genie(
      fillInWish({
        context: {
          all: ['context1', 'context3'],
          any: ['context4', 'context5'],
          none: ['context2'],
        },
      }),
    )
    done()
  })
  test('should have all wishes when genie.context is default', () => {
    expect(genie.getMatchingWishes()).toHaveLength(9)
  })

  test('should have only wishes with default context when genie.context is not default', () => {
    genie.context('different-context')
    const matchingWishes = genie.getMatchingWishes()
    expect(matchingWishes).toHaveLength(2)
    expect(matchingWishes[0]).toBe(complexContextNone)
    expect(matchingWishes[1]).toBe(defaultContextWish)
  })

  test('should have only in context wishes (including default context wishes) when genie.context is not default', () => {
    genie.context('context1')
    expect(genie.getMatchingWishes()).toHaveLength(4)
  })

  test('should be able to have multiple contexts', () => {
    genie.context(['context1', 'context2'])
    expect(genie.getMatchingWishes()).toHaveLength(5)
  })

  test('should be able to add a string context', () => {
    genie.context('context1')
    genie.addContext('context2')
    expect(genie.getMatchingWishes()).toHaveLength(5)
  })

  test('should be able to add an array of contexts', () => {
    genie.context('context1')
    genie.addContext(['context2', 'context3'])
    expect(genie.getMatchingWishes()).toHaveLength(7)
  })

  test('should be able to remove string context', () => {
    genie.context(['context1', 'context2'])
    expect(genie.getMatchingWishes()).toHaveLength(5)

    genie.removeContext('context1')
    expect(genie.getMatchingWishes()).toHaveLength(3)
  })

  test('should be able to remove an array of contexts', () => {
    genie.context(['context1', 'context2', 'context3'])
    expect(genie.getMatchingWishes()).toHaveLength(7)

    genie.removeContext(['context1', 'context2'])
    expect(genie.getMatchingWishes()).toHaveLength(5)
  })

  test('should be able to manage complex contexts', () => {
    genie.context(['context1', 'context3', 'context5'])
    const allWishes = genie.getMatchingWishes()
    expect(allWishes).toHaveLength(6)
  })
}) // end #context #addContext #removeContext

describe('#getMatchingWishes', () => {
  beforeEach(prepForTest)
  let wishes, wishesArray
  beforeEach(() => {
    wishes = {}
    wishesArray = []
    wishes.equal = genie(
      fillInWish({
        magicWords: 'tTOtc', // equal
      }),
    )
    wishesArray.push(wishes.equal)

    wishes.equal2 = genie(
      fillInWish({
        magicWords: ['First Magic Word', 'tTOtc'], // equal 2nd magic word
      }),
    )
    wishesArray.push(wishes.equal2)

    wishes.contains = genie(
      fillInWish({
        magicWords: 'The ttotc container', // contains
      }),
    )
    wishesArray.push(wishes.contains)

    wishes.contains2 = genie(
      fillInWish({
        magicWords: ['First Magic Word', 'The ttotc container'], // contains 2nd magic word
      }),
    )
    wishesArray.push(wishes.contains2)

    wishes.acronym = genie(
      fillInWish({
        magicWords: 'The Tail of Two Cities', // acronym
      }),
    )
    wishesArray.push(wishes.acronym)

    wishes.acronym2 = genie(
      fillInWish({
        magicWords: ['First Magic Word', 'The Tail of Two Cities'], // acronym 2nd magic word
      }),
    )
    wishesArray.push(wishes.acronym2)

    wishes.match = genie(
      fillInWish({
        magicWords: 'The Tail of Forty Cities', // match
      }),
    )
    wishesArray.push(wishes.match)

    wishes.match2 = genie(
      fillInWish({
        magicWords: ['First Magic Word', 'The Tail of Forty Cities'], // match 2nd magic word
      }),
    )
    wishesArray.push(wishes.match2)

    wishes.noMatch = genie(
      fillInWish({
        magicWords: 'no match',
      }),
    )
    wishesArray.push(wishes.noMatch)
  })

  test('should return wishes in order of most recently registered when not given any params', () => {
    const allWishes = genie.getMatchingWishes()
    let j = wishesArray.length - 1
    for (let i = 0; i < allWishes.length && j >= 0; i++, j--) {
      expect(allWishes[i]).toBe(wishesArray[j])
    }
  })

  test('should match equal, contains, acronym, and then match with the second magic word match coming after the first', () => {
    const ttotcAcronym = 'ttotc'

    // Even though they were registered in reverse order, the matching should follow this pattern
    const matchingWishes = genie.getMatchingWishes(ttotcAcronym)
    expect(matchingWishes).toHaveLength(wishesArray.length - 1)
    expect(matchingWishes[0]).toBe(wishes.equal)
    expect(matchingWishes[1]).toBe(wishes.equal2)
    expect(matchingWishes[2]).toBe(wishes.contains)
    expect(matchingWishes[3]).toBe(wishes.contains2)
    expect(matchingWishes[4]).toBe(wishes.acronym)
    expect(matchingWishes[5]).toBe(wishes.acronym2)
    expect(matchingWishes[6]).toBe(wishes.match)
    expect(matchingWishes[7]).toBe(wishes.match2)
  })

  // eslint-disable-next-line max-statements
  test('should match entered magic words before anything else', () => {
    genie.makeWish(wishes.contains, 'tt')
    // This shouldn't affect the results of a search with more text

    genie.makeWish(wishes.match, 'ttot')
    let matchingWishes = genie.getMatchingWishes('ttot')
    expect(matchingWishes).toHaveLength(wishesArray.length - 1)
    expect(matchingWishes[0]).toBe(wishes.match)
    expect(matchingWishes[1]).toBe(wishes.equal) // starts with (not equal) in this case
    expect(matchingWishes[2]).toBe(wishes.equal2) // starts with 2 in this case
    expect(matchingWishes[3]).toBe(wishes.contains)
    expect(matchingWishes[4]).toBe(wishes.contains2)
    expect(matchingWishes[5]).toBe(wishes.acronym)
    expect(matchingWishes[6]).toBe(wishes.acronym2)
    expect(matchingWishes[7]).toBe(wishes.match2)

    genie.makeWish(wishes.match2, 'ttotc')
    matchingWishes = genie.getMatchingWishes('ttot')
    expect(matchingWishes).toHaveLength(wishesArray.length - 1)
    expect(matchingWishes[0]).toBe(wishes.match)
    expect(matchingWishes[1]).toBe(wishes.match2)
    expect(matchingWishes[2]).toBe(wishes.equal) // starts with in this case
    expect(matchingWishes[3]).toBe(wishes.equal2) // starts with 2 in this case
    expect(matchingWishes[4]).toBe(wishes.contains)
    expect(matchingWishes[5]).toBe(wishes.contains2)
    expect(matchingWishes[6]).toBe(wishes.acronym)
    expect(matchingWishes[7]).toBe(wishes.acronym2)

    matchingWishes = genie.getMatchingWishes('ttotc')
    expect(matchingWishes).toHaveLength(wishesArray.length - 1)
    expect(matchingWishes[0]).toBe(wishes.match2)
    expect(matchingWishes[1]).toBe(wishes.equal)
    expect(matchingWishes[2]).toBe(wishes.equal2)
    expect(matchingWishes[3]).toBe(wishes.contains)
    expect(matchingWishes[4]).toBe(wishes.contains2)
    expect(matchingWishes[5]).toBe(wishes.acronym)
    expect(matchingWishes[6]).toBe(wishes.acronym2)
    expect(matchingWishes[7]).toBe(wishes.match)
  })

  test('should follow the rules with "on deck" and "king of the hill"', () => {
    const fred = wishes.contains2
    const ethel = wishes.acronym2
    const lucy = wishes.match2

    const wordToGet = 'magic'

    // In opposite order of their registration
    let mertzMatch = genie.getMatchingWishes(wordToGet)
    expect(mertzMatch[0]).toBe(lucy)
    expect(mertzMatch[1]).toBe(ethel)
    expect(mertzMatch[2]).toBe(fred)

    // In order of called then opposite registration
    genie.makeWish(ethel, wordToGet)
    mertzMatch = genie.getMatchingWishes(wordToGet)
    expect(mertzMatch[0]).toBe(ethel)
    expect(mertzMatch[1]).toBe(lucy)
    expect(mertzMatch[2]).toBe(fred)

    /*
     * More complicated here. A specific wish must be called
     * twice in a row for a specific magic word for it to
     * be lucy if that magic word already has a wish
     * associated with it. So lucy must be called with
     * 'mertz' twice in a row before she can take the
     * top spot.
     */
    genie.makeWish(lucy, wordToGet)
    mertzMatch = genie.getMatchingWishes(wordToGet)
    expect(mertzMatch[0]).toBe(ethel)
    expect(mertzMatch[1]).toBe(lucy)
    expect(mertzMatch[2]).toBe(fred)

    /*
     * Lucy is now king of the hill.
     * Ethel is second, and fred isn't
     * even on the hill at all...
     */
    genie.makeWish(lucy, wordToGet)
    mertzMatch = genie.getMatchingWishes(wordToGet)
    expect(mertzMatch[0]).toBe(lucy)
    expect(mertzMatch[1]).toBe(ethel)
    expect(mertzMatch[2]).toBe(fred)

    /*
     * De-registering lucy and making a
     * wish with fred will place ethel as
     * king of the hill and fred as second
     */
    genie.deregisterWish(lucy)
    genie.makeWish(fred, wordToGet)
    mertzMatch = genie.getMatchingWishes(wordToGet)
    expect(mertzMatch).toHaveLength(3)
    expect(mertzMatch[0]).toBe(ethel)
    expect(mertzMatch[1]).toBe(fred)
  })
})

describe('#enabled', () => {
  describe('returnOnDisabled behavior when disabled', () => {
    beforeEach(prepForTest)
    test('should cause functions to return a reasonable empty return when enabled', () => {
      genie.enabled(false)
      expect(genie()).toEqual({})
      expect(genie.getMatchingWishes()).toEqual([])
      expect(genie.makeWish()).toEqual({})
      expect(genie.options()).toEqual({})
      expect(genie.deregisterWish()).toEqual({})
      expect(genie.reset()).toEqual({})
      expect(genie.context()).toEqual([])
      expect(genie.revertContext()).toEqual([])
      expect(genie.restoreContext()).toEqual([])
      expect(genie.enabled()).toBe(false)
      expect(genie.returnOnDisabled()).toBe(true)
    })
    test('should cause functions to return a reasonable empty return when disabled', () => {
      genie.returnOnDisabled(false)
      genie.enabled(false)

      expect(genie()).toBeNull()
      expect(genie.getMatchingWishes()).toBeNull()
      expect(genie.makeWish()).toBeNull()
      expect(genie.options()).toBeNull()
      expect(genie.deregisterWish()).toBeNull()
      expect(genie.reset()).toBeNull()
      expect(genie.context()).toBeNull()
      expect(genie.revertContext()).toBeNull()
      expect(genie.restoreContext()).toBeNull()
      expect(genie.enabled()).toBe(false) // Special case. Enabled always runs.
      expect(genie.returnOnDisabled()).toBeNull()
    })
  })
})

// UTIL FUNCTIONS

function fillInWish(defaults) {
  defaults = defaults || {}
  if (typeof defaults === 'string') {
    defaults = {
      magicWords: defaults,
    }
  }
  return createWishWithDefaults(defaults)
}

function createWishWithDefaults(defaults) {
  return {
    id: defaults.id,
    context: defaults.context,
    data: defaults.data,
    magicWords: defaults.magicWords || 'magicWords',
    action: defaults.action || function defaultAction() {},
  }
}

function prepForTest(done) {
  genie.reset()
  genie.restoreContext()
  genie.enabled(true)
  genie.returnOnDisabled(true)

  if (done) {
    done()
  }
}

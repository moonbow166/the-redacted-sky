# My sky browser regression checks

Use a local preview. Do not populate or clear a visitor's production sky. Tests below were exercised through browser UI after the independent review fixes.

## Undo restores the visible relation, not just storage

1. Keep Lights over Utah and A balloon comparison.
2. Leave Not sure yet selected and choose Connect these clues.
3. Select Might connect and activate Update my connection with Enter.
4. Activate Undo with Enter.
5. Confirm all four surfaces agree: Not sure yet radio checked, Connection saved button disabled, saved connection list says Not sure yet, one personal edge remains.

Observed after step 4:

```json
{"selected":"unsure","button":"Connection saved","disabled":true,"savedList":"Lights over Utah\nNot sure yet\nA balloon comparison","personalEdges":1,"overflow":false}
```

Screenshot: /tmp/my-sky-verdict-desktop-undo.jpg. No extra test runner or browser automation dependency is installed; this is a repeatable UI check plus its execution receipt, not a claim of automated UI coverage.

## First keep is immediately visible on phone

At a 390 x 844 viewport, begin with no saved clues. The pocket sky says Your sky is empty and Keep a clue to begin. Keep this clue is visible directly below the film, above the dock. Keep Lights over Utah. The dock immediately changes to 1 clue kept and Keep one more clue, with one filled node. View sky opens the main constellation.

Screenshots: /tmp/my-sky-verdict-mobile-empty.jpg and /tmp/my-sky-verdict-mobile-one.jpg. The dock reserves bottom page space and controls have bottom scroll margin. No horizontal overflow was observed.

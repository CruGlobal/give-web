---
name: spec
description: Write a spec for a ticket with superpowers. Run first, before any tests or code.
argument-hint: '[ticket-key]'
disable-model-invocation: true
---

Write a spec for ticket $ARGUMENTS.

1. Read the ticket and any project docs the developer gives you.
2. Use superpowers:brainstorming to write the spec. Ask one question at a time.
3. If the change is visual (a layout, a new screen, anything that changes with
   the window size), build a throwaway mockup before the spec is final. Let the
   developer click through it at phone width, laptop width with any sidebar
   open, and a wide screen. Write the layout into the spec as rules ("chips are
   whole or hidden", "the title keeps at least 88px"), not pixel positions.
   Delete the mockup.
4. Save it to docs/superpowers/specs/YYYY-MM-DD-<KEY>-<topic>-design.md with:
   Why, In scope, Out of scope, Acceptance criteria (numbered, each one
   testable), Risky (does it touch a one-way-door path in CLAUDE.md?),
   Questions for the BA.
5. Ask the developer to read every line. Then:
   - Not clear: pause and research. Explain how it works, or point them to
     the screen in the app.
   - Wrong: change it.
   - A business question you cannot answer: add it to "Questions for the BA".
     Do not guess.
6. If "Questions for the BA" is not empty, stop. Tell the developer to ask
   the BA and run /spec again with the answers.
7. When the developer says they understand every change, commit the spec.
   Tell them to share it with their Tech Lead, then run /answer-key <spec-path>.
   From there the agent runs to an open PR with CI green before it stops.

Do not write tests, a plan or code.

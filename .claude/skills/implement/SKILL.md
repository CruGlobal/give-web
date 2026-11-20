---
name: implement
description: Check the answer keys, plan, build with ultracode, then test and review with one fresh checker agent. One review round.
argument-hint: '[path-to-spec]'
disable-model-invocation: true
---

Implement the spec at $ARGUMENTS.

Run every step below, then /pr, without stopping. Do all you can before you
stop. Stop early only for a question whose answer changes what gets built.
Anything else goes in the PR description.

1. Preflight: run the preflight from CLAUDE.md. If dependencies are missing or
   the app does not boot, fix it or tell the developer before anything else.
2. Start the checker: a fresh agent (Agent tool) that never writes app code.
   Keep its id, because you will send it more work later with SendMessage.
   Its first job: read the ticket, the spec and the answer-key tests (not the
   code) and report:
   - Is every requirement in the ticket, and every acceptance criterion, tested?
   - Do the tests check behaviour, not names or pixel positions?
   - Would a wrong build still pass?
   - Is anything in the ticket or spec unclear or contradictory?

   Fix the answer keys from its report and commit, before the build. A question
   only the developer or the BA can answer: if the answer changes what gets
   built, stop and ask. If not, note it for the PR and keep going.

3. Use superpowers:writing-plans to write a plan from the spec. Save it in
   docs/superpowers/plans/. Cut anything the spec did not ask for. Do not wait
   for anyone to read or approve it; go straight on to the build.
4. Build with ultracode: call the Workflow tool with builder agents. Give them
   the spec and the plan. Tell every agent: "Do not edit anything in
   <answer-key folder>. Do not special-case inputs to make tests pass."
   Retry an agent once if it dies on a network error.
5. Run the answer-key tests. If they are on the answer-key/<KEY> branch, first
   run: git checkout answer-key/<KEY> -- <answer-key folder>
   A failing test means the code is wrong, not the test. Send the failure back
   to a builder. If the build shows an answer key itself is wrong, ask the
   developer before changing it.
6. This must print nothing: git diff --name-only <answer-key commit> -- <answer-key folder>
   If it prints a file the developer did not approve, that is a fail. Stop and
   tell the developer.
7. Send the checker its second job (SendMessage, same agent):
   a. Write unit tests for the new code (git diff <base>...HEAD), following the
   repo's test conventions. Do not touch the answer-key folder or app code.
   Prove each test can fail: undo the code it covers, run it, see it fail,
   put the code back.
   b. Review the whole change against the ticket and the spec. Prove every
   finding by running something (a test, a script, the browser), not by
   reading. Check: does any code special-case the test inputs, or do mocks
   replace the code under test? Keyboard and focus, screen readers, phone
   width, dark mode. Does the same thing exist one level up or down (other
   screens, the API as well as the UI)? What input can these tests not
   express? Report what it checked and found clean, not only problems.
   Risky work: a second fresh agent does part b, not the checker.
8. A builder fixes the blocking and should-fix findings, each with a test that
   fails without the fix. Then send the checker its last job: check only the
   fix commits and what they touch. That is the one review round. Nits go in
   the PR description.
9. Run locally: the answer keys, the new tests and the test files near the
   change. The full suite runs on the PR's CI.
10. Write a small demo-data script for the spec's scenarios (development only),
    with the links to try and how to sign in.
11. Read .claude/skills/pr/SKILL.md and do every step in it, without stopping.

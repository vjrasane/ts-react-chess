import { Selector } from "testcafe";

fixture("Test").page("http://localhost:8080");

const selectPiece = (pos: string, piece: string, player: string) =>
  Selector(`#${pos}-content`)
    .withAttribute("data-piece", piece)
    .withAttribute("data-player", player);

const makeMove = (
  t: TestController,
  pos: string,
  piece: string,
  player: string,
  target: string
): Promise<void> =>
  t
    .expect(selectPiece(pos, piece, player).exists)
    .ok()
    .dragToElement(selectPiece(pos, piece, player), Selector(`#${target}`))
    .expect(selectPiece(target, piece, player).exists)
    .ok();

test("Fried liver attack", async (t: TestController) => {
  await makeMove(t, "e2", "pawn", "white", "e4");
  await makeMove(t, "e7", "pawn", "black", "e5");
  await makeMove(t, "g1", "knight", "white", "f3");
  await makeMove(t, "b8", "knight", "black", "c6");
  await makeMove(t, "f1", "bishop", "white", "c4");
  await makeMove(t, "g8", "knight", "black", "f6");
  await makeMove(t, "f3", "knight", "white", "g5");
  await makeMove(t, "d7", "pawn", "black", "d5");
  await makeMove(t, "e4", "pawn", "white", "d5");
  await makeMove(t, "f6", "knight", "black", "d5");
  await makeMove(t, "g5", "knight", "white", "f7");
  await makeMove(t, "e8", "king", "black", "f7");
  await makeMove(t, "d1", "queen", "white", "f3");
  await t
    .expect(Selector("#f7-state").withAttribute("data-state", "check").exists)
    .ok();
  await makeMove(t, "f7", "king", "black", "g8");
  await t
    .expect(Selector("#g8-state").withAttribute("data-state", "check").exists)
    .notOk();
  await makeMove(t, "c4", "bishop", "white", "d5");
  await t
    .expect(Selector("#g8-state").withAttribute("data-state", "check").exists)
    .ok();
  await makeMove(t, "d8", "queen", "black", "d5");
  await t
    .expect(Selector("#g8-state").withAttribute("data-state", "check").exists)
    .notOk();
  await makeMove(t, "f3", "queen", "white", "d5");
  await t
    .expect(Selector("#g8-state").withAttribute("data-state", "check").exists)
    .ok();
  await makeMove(t, "c8", "bishop", "black", "e6");
  await t
    .expect(Selector("#g8-state").withAttribute("data-state", "check").exists)
    .notOk();
  await makeMove(t, "d5", "queen", "white", "e6");
  await t
    .expect(
      Selector("#g8-state").withAttribute("data-state", "checkmate").exists
    )
    .ok();
});

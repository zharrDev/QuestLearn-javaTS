extends Node
## Headless end-to-end test: real backend login, world list, typing session,
## arena simulation, submit, and result validation.

const ARENA := preload("res://scripts/arena.gd")

var passed := 0
var failed := 0
var details: Array = []

func check(label: String, ok: bool, detail = null) -> void:
	if ok:
		passed += 1
	else:
		failed += 1
	var line := ("PASS " if ok else "FAIL ") + label
	if detail != null:
		line += " :: " + str(detail)
	print(line)
	details.append({"name": label, "ok": ok, "detail": detail})

func _ready() -> void:
	await get_tree().process_frame
	print("== QuestLearn Godot smoke test ==")

	var login: Dictionary = await Api.login("siswa@demo.id", "demo123")
	check("backend login", bool(login["ok"]) and Api.token != "", str(login["message"]))
	if not login["ok"]:
		_finish()
		return

	var me: Dictionary = await Api.me()
	check("auth token accepted", bool(me["ok"]) and str(me["data"].get("nama", "")) == "Demo Siswa", str(me["data"].get("nama", "")))

	var worlds_res: Dictionary = await Api.worlds()
	var worlds: Array = worlds_res["data"] if typeof(worlds_res["data"]) == TYPE_ARRAY else []
	check("six language worlds from backend", worlds.size() >= 6, worlds.size())
	var target_world: Dictionary = {}
	for w in worlds:
		if str(w.get("slug", "")) == "bahasa-indonesia":
			target_world = w
	if target_world.is_empty() and worlds.size() > 0:
		target_world = worlds[0]
	check("indonesian world present", not target_world.is_empty(), target_world.get("slug", ""))

	var start: Dictionary = await Api.start_typing(int(target_world.get("id", 1)), "EASY")
	var session: Dictionary = start["data"] if typeof(start["data"]) == TYPE_DICTIONARY else {}
	var words: Array = session.get("words", []) if session.has("words") else []
	check("typing session words", bool(start["ok"]) and words.size() > 0, words.size())
	if not start["ok"] or words.is_empty():
		_finish()
		return

	var info := WorldData.info(str(session.get("duniaSlug", target_world.get("slug", "bahasa-indonesia"))))
	var arena = ARENA.new()
	arena.setup(session, "EASY", 60.0, info)
	var emitted: Array = []
	arena.finished.connect(func(result: Dictionary) -> void: emitted.append(result))
	add_child(arena)
	await get_tree().process_frame
	await get_tree().process_frame

	check("arena built", arena.hud != null and arena.hero != null and arena.bg_rect.texture != null, null)
	check("hero slash frames loaded", arena.hero.sprite_frames.get_frame_count("slash") == 7, arena.hero.sprite_frames.get_frame_count("slash"))
	check("starting crates spawned", arena.groups.size() >= 3, arena.groups.size())
	check("ready overlay shown", arena.phase == "ready", arena.phase)

	arena.debug_start()
	check("run starts", arena.phase == "playing", arena.phase)

	var typed_words := 0
	for i in 6:
		var group = arena.active_group()
		if group == null:
			await get_tree().create_timer(0.2).timeout
			continue
		var word := str(group["word"])
		arena.debug_type(word)
		typed_words += 1
		await get_tree().create_timer(0.08).timeout

	check("typing clears words", arena.kills >= 4, {"kills": arena.kills, "typed": typed_words})
	check("score accumulates", arena.score > 0, arena.score)
	check("accuracy tracked", arena.correct_chars > 0 and arena.total_keys >= arena.correct_chars, {"correct": arena.correct_chars, "keys": arena.total_keys})
	check("target ribbon text generated", str(arena._hud_state().get("target_bbcode", "")).length() > 0, null)

	var hp_before: int = arena.hp
	arena.debug_force_miss()
	check("miss costs a heart", arena.hp == hp_before - 1 and arena.missed == 1, {"hp": arena.hp, "missed": arena.missed})

	arena.debug_finish()
	check("run finish emits result", emitted.size() == 1, emitted.size())
	if emitted.size() != 1:
		_finish()
		return
	var result: Dictionary = emitted[0]
	var payload_ok := true
	for key in ["duniaId", "level", "skor", "wpm", "akurasi", "comboTerpanjang", "totalMusuhKalah", "totalMusuhLolos", "waktuMillis"]:
		if not result.has(key):
			payload_ok = false
	check("result payload matches backend contract", payload_ok, result)

	var submit: Dictionary = await Api.submit_typing(result)
	check("backend accepts submitted run", bool(submit["ok"]), str(submit["message"]))
	if submit["ok"]:
		var saved: Dictionary = submit["data"]
		check("saved run has xp", int(saved.get("xpDidapat", 0)) > 0, saved.get("xpDidapat", 0))

	_finish()

func _finish() -> void:
	print("\nSUMMARY " + JSON.stringify({"passed": passed, "failed": failed, "details": details}))
	get_tree().quit(1 if failed > 0 else 0)

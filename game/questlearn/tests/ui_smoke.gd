extends Node

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
	print("== QuestLearn guest UI smoke test ==")
	Api.clear_session()
	Profile.settings["last_world"] = "bahasa-indonesia"
	Profile.settings["last_level"] = "EASY"
	Profile.settings["last_duration"] = 60
	Profile.save_settings()

	var main = load("res://main.tscn").instantiate()
	add_child(main)
	await get_tree().process_frame
	await get_tree().process_frame
	check("title screen", main.screen_name == "title", main.screen_name)
	check("guest profile", not Api.is_logged_in(), Profile.identity_label())

	main._on_play_pressed()
	await get_tree().process_frame
	check("world select opens", main.screen_name == "worlds", main.screen_name)
	check("six offline worlds", main.worlds.size() == 6, main.worlds.size())
	check("indonesian selected", main.selected_slug == "bahasa-indonesia" and main.selected_id == 2, {"slug": main.selected_slug, "id": main.selected_id})
	check("start enabled", main.start_button != null and not main.start_button.disabled, null)

	await main._start_session()
	await get_tree().process_frame
	await get_tree().process_frame
	check("arena opens", main.arena != null and is_instance_valid(main.arena), null)
	if main.arena != null:
		check("local words loaded", main.arena.world_words.size() > 0, main.arena.world_words.size())
		check("arena ready", main.arena.phase == "ready", main.arena.phase)
		main.arena.debug_start()
		var group = main.arena.active_group()
		if group != null:
			main.arena.debug_type(str(group["word"]))
		await get_tree().create_timer(0.2).timeout
		check("guest run scores", main.arena.score > 0, main.arena.score)
		main.arena.debug_finish()
		await get_tree().process_frame
		await get_tree().process_frame
		check("result screen opens", main.screen_name == "result", main.screen_name)
		check("local run saved", int(Profile.profile.get("total_runs", 0)) > 0, Profile.profile.get("total_runs", 0))
		check("local xp saved", int(Profile.profile.get("xp", 0)) > 0, Profile.profile.get("xp", 0))

	print("\nSUMMARY " + JSON.stringify({"passed": passed, "failed": failed, "details": details}))
	get_tree().quit(1 if failed > 0 else 0)

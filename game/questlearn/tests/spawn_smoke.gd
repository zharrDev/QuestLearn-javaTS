extends Node
## Headless cadence check: simulate a 100 WPM player for 30s, 60s and 5min.
## Fails if the arena ever has no target on screen or entering within 2s,
## or if spawn positions drift away from the view over time.

const ARENA := preload("res://scripts/arena.gd")
const VIEW_W := 640.0
const STEP := 1.0 / 60.0
const BOT_INTERVAL := 0.12

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
	print("== QuestLearn spawn cadence test ==")
	for seconds in [30, 60, 300]:
		var result: Dictionary = await _simulate(seconds)
		check(
			"spawn cadence %ds" % seconds,
			float(result["worst_gap"]) <= 2.0,
			result
		)
		check(
			"spawn positions stay near view %ds" % seconds,
			float(result["max_spawn_x"]) <= VIEW_W + 900.0,
			result
		)
	print("\nSUMMARY " + JSON.stringify({"passed": passed, "failed": failed, "details": details}))
	get_tree().quit(1 if failed > 0 else 0)

func _simulate(seconds: int) -> Dictionary:
	var info := WorldData.info("bahasa-indonesia")
	var session := {
		"duniaId": 2,
		"words": WorldData.fallback_words("bahasa-indonesia", "EASY"),
	}
	var arena = ARENA.new()
	arena.setup(session, "EASY", float(seconds) + 1.0, info)
	add_child(arena)
	await get_tree().process_frame
	await get_tree().process_frame
	arena.set_process(false)
	arena.max_hp = 9999
	arena.debug_start()

	var seen: Dictionary = {}
	for g in arena.groups:
		seen[int(g["id"])] = true
	var spawns := arena.groups.size()
	var max_spawn_x := 0.0
	for g in arena.groups:
		max_spawn_x = maxf(max_spawn_x, float(g["x"]))

	var worst_gap := 0.0
	var current_gap := 0.0
	var bot_timer := 0.0
	var frames := int(seconds * 60)
	for frame in frames:
		if arena.phase != "playing":
			break
		arena._process(STEP)
		bot_timer += STEP
		if bot_timer >= BOT_INTERVAL:
			bot_timer = 0.0
			var group = arena.active_group()
			if group != null:
				var typed := int(group["typed"])
				if typed < int(group["chars"].size()):
					arena.process_char(str(group["chars"][typed]))
		for g in arena.groups:
			var id := int(g["id"])
			if not seen.has(id):
				seen[id] = true
				spawns += 1
				max_spawn_x = maxf(max_spawn_x, float(g["x"]))
		current_gap = 0.0 if _has_near_target(arena) else current_gap + STEP
		worst_gap = maxf(worst_gap, current_gap)

	var result := {
		"seconds": seconds,
		"spawns": spawns,
		"max_spawn_x": max_spawn_x,
		"worst_gap": snappedf(worst_gap, 0.01),
		"cleared": arena.kills,
		"missed": arena.missed,
	}
	arena.queue_free()
	await get_tree().process_frame
	return result

func _has_near_target(arena) -> bool:
	for g in arena.groups:
		if int(g["typed"]) >= int(g["chars"].size()):
			continue
		var x := float(g["x"])
		if x < VIEW_W:
			return true
		if (x - VIEW_W) / float(arena.cfg["speed"]) <= 2.0:
			return true
	return false

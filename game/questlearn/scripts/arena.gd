class_name TypingArena
extends Node2D
## Pixel-art typing arena, ported from the web game to Godot.
##
## The hero stands on the left while letter crates ride in on cliff platforms.
## Typing the glowing letter smashes that crate; clear the word before it
## reaches the hero. All art comes from the PNG assets in res://art.

signal finished(result: Dictionary)

const VIEW_W := 640.0
const VIEW_H := 360.0
const GROUND_Y := 300.0
const HOME_X := 148.0
const TIER_H := 62.0
const CELL := 38.0
const CELL_GAP := 5.0
const PAD := 13.0
const START_COUNTDOWN := 2.6
const GRAVITY := 1500.0
const HERO_CANVAS := 96
const HERO_SCALE := 0.8
const HERO_FEET_MARGIN := 1.0

const CONFIG := {
	"EASY": {"on_screen": 3, "hearts": 5, "speed": 27.0, "tier_max": 1},
	"MEDIUM": {"on_screen": 3, "hearts": 4, "speed": 34.0, "tier_max": 2},
	"HARD": {"on_screen": 4, "hearts": 3, "speed": 42.0, "tier_max": 2},
}

var world_info: Dictionary = {}
var session: Dictionary = {}
var level := "EASY"
var duration := 60.0
var dungeon_id := 1

var cfg: Dictionary = CONFIG["EASY"]
var phase := "ready"
var time := 0.0
var elapsed := 0.0
var countdown := 3.0
var last_count := 4
var cam_x := 0.0
var score := 0
var combo := 0
var max_combo := 0
var kills := 0
var missed := 0
var hp := 5
var max_hp := 5
var correct_keys := 0
var total_keys := 0
var correct_chars := 0
var over_reason := "time"
var over_t := 0.0
var emitted := false

var groups: Array = []
var pool: Array = []
var last_word := ""
var last_right := 0.0
var locked_id := -1
var seq := 0
var world_words: Array = []

var particles: Array = []
var floats: Array = []
var shake := 0.0
var shake_offset := Vector2.ZERO
var lunge := 0.0
var lunge_target := 0.0
var jump_offset := 0.0
var jump_vy := 0.0
var airborne := false
var action := ""
var action_t := 0.0
var force_tier := -1

var crates_root: Node2D
var hero: AnimatedSprite2D
var fx: Node2D
var hud: GameHud
var sfx: Sfx
var bg_rect: TextureRect
var bg_layer: CanvasLayer
var hud_layer: CanvasLayer

const FX_SCRIPT = preload("res://scripts/arena_fx.gd")

func setup(p_session: Dictionary, p_level: String, p_duration: float, p_world: Dictionary) -> void:
	session = p_session
	level = p_level
	duration = p_duration
	world_info = p_world
	cfg = CONFIG.get(level, CONFIG["EASY"])
	max_hp = int(cfg["hearts"])
	hp = max_hp
	dungeon_id = int(session.get("duniaId", 1))
	world_words = []
	var words = session.get("words", [])
	if typeof(words) == TYPE_ARRAY:
		for w in words:
			if typeof(w) == TYPE_STRING and str(w).strip_edges() != "":
				world_words.append(str(w))
	if world_words.is_empty():
		world_words = WorldData.fallback_words(str(world_info.get("slug", "bahasa-inggris")), level)

func _ready() -> void:
	world_info = world_info if not world_info.is_empty() else WorldData.info("bahasa-inggris")
	_build_background()
	z_index = 0
	crates_root = Node2D.new()
	crates_root.name = "Crates"
	add_child(crates_root)
	_build_hero()
	fx = FX_SCRIPT.new()
	fx.set("arena", self)
	fx.z_index = 20
	add_child(fx)
	_build_hud()
	sfx = Sfx.new()
	add_child(sfx)
	sfx.set_muted(sfx.muted)
	hud.set_muted(sfx.muted)

	hud.start_pressed.connect(start_run)
	hud.pause_pressed.connect(toggle_pause)
	hud.mute_pressed.connect(func() -> void: hud.set_muted(sfx.toggle()))
	hud.resume_pressed.connect(resume_run)
	hud.restart_pressed.connect(start_run)
	hero.animation_finished.connect(_on_animation_finished)

	reset_run()

func _build_background() -> void:
	bg_layer = CanvasLayer.new()
	bg_layer.layer = -2
	add_child(bg_layer)
	bg_rect = TextureRect.new()
	bg_rect.texture = load(str(world_info.get("bg", "res://art/village-960x360.png")))
	bg_rect.position = Vector2(-40, -10)
	bg_rect.size = Vector2(720, 380)
	bg_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	bg_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	bg_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	bg_layer.add_child(bg_rect)

func _build_hero() -> void:
	var frames := SpriteFrames.new()
	_add_anim(frames, "idle", ["idle_01", "idle_02", "idle_03", "idle_04"], 7.0, true)
	_add_anim(frames, "run", ["run_01", "run_02", "run_03", "run_04", "run_05", "run_06", "run_07"], 14.0, true)
	_add_anim(frames, "jump", ["jump_01", "jump_02"], 6.0, false)
	_add_anim(frames, "slash", ["sword_slash_attack_01", "sword_slash_attack_02", "sword_slash_attack_03", "sword_slash_attack_04", "sword_slash_attack_05", "sword_slash_attack_06", "sword_slash_attack_07"], 22.0, false)
	hero = AnimatedSprite2D.new()
	hero.sprite_frames = frames
	hero.animation = "idle"
	hero.scale = Vector2.ONE * HERO_SCALE
	hero.position = Vector2(HOME_X, _hero_base_y())
	hero.z_index = 10
	hero.material = _hero_material()
	hero.play()
	add_child(hero)

func _hero_base_y() -> float:
	return GROUND_Y - (HERO_CANVAS * HERO_SCALE) / 2.0 + HERO_FEET_MARGIN

func _hero_material() -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = """
shader_type canvas_item;
uniform vec4 outline_color : source_color = vec4(0.015, 0.025, 0.04, 0.9);
uniform float outline_size = 1.0;
void fragment() {
	vec2 p = TEXTURE_PIXEL_SIZE * outline_size;
	vec4 base = texture(TEXTURE, UV);
	if (base.a > 0.08) {
		COLOR = base;
	} else {
		float a = 0.0;
		a = max(a, texture(TEXTURE, UV + vec2(p.x, 0.0)).a);
		a = max(a, texture(TEXTURE, UV - vec2(p.x, 0.0)).a);
		a = max(a, texture(TEXTURE, UV + vec2(0.0, p.y)).a);
		a = max(a, texture(TEXTURE, UV - vec2(0.0, p.y)).a);
		a = max(a, texture(TEXTURE, UV + p).a);
		a = max(a, texture(TEXTURE, UV - p).a);
		a = max(a, texture(TEXTURE, UV + vec2(p.x, -p.y)).a);
		a = max(a, texture(TEXTURE, UV + vec2(-p.x, p.y)).a);
		if (a > 0.08) {
			COLOR = vec4(outline_color.rgb, outline_color.a);
		} else {
			COLOR = vec4(0.0);
		}
	}
}
"""
	var mat := ShaderMaterial.new()
	mat.shader = shader
	return mat

func _add_anim(frames: SpriteFrames, anim: String, files: Array, speed: float, loop: bool) -> void:
	frames.add_animation(anim)
	frames.set_animation_speed(anim, speed)
	frames.set_animation_loop(anim, loop)
	for name in files:
		var tex := load("res://art/%s.png" % name)
		if tex != null:
			frames.add_frame(anim, _normalize_frame(tex))

func _normalize_frame(tex: Texture2D) -> Texture2D:
	var img := tex.get_image()
	if img == null:
		return tex
	if img.is_compressed():
		img.decompress()
	img.convert(Image.FORMAT_RGBA8)
	var w := img.get_width()
	var h := img.get_height()
	if w > HERO_CANVAS or h > HERO_CANVAS:
		var factor := minf(float(HERO_CANVAS) / float(w), float(HERO_CANVAS) / float(h))
		img.resize(maxi(1, int(w * factor)), maxi(1, int(h * factor)), Image.INTERPOLATE_NEAREST)
		w = img.get_width()
		h = img.get_height()
	var canvas := Image.create(HERO_CANVAS, HERO_CANVAS, false, Image.FORMAT_RGBA8)
	canvas.fill(Color(0, 0, 0, 0))
	canvas.blit_rect(img, Rect2i(0, 0, w, h), Vector2i((HERO_CANVAS - w) / 2, HERO_CANVAS - h))
	return ImageTexture.create_from_image(canvas)

func _build_hud() -> void:
	hud_layer = CanvasLayer.new()
	hud_layer.layer = 10
	add_child(hud_layer)
	hud = GameHud.new()
	hud_layer.add_child(hud)
	hud.setup(world_info, level, duration, max_hp)

func _on_animation_finished() -> void:
	if hero.animation == "slash" or hero.animation == "jump":
		action = ""
		hero.play("idle")

# ------------------------------------------------------------------ #
# Run lifecycle                                                       #
# ------------------------------------------------------------------ #

func reset_run() -> void:
	phase = "ready"
	time = 0.0
	elapsed = 0.0
	countdown = START_COUNTDOWN
	last_count = 4
	cam_x = 0.0
	score = 0
	combo = 0
	max_combo = 0
	kills = 0
	missed = 0
	hp = max_hp
	correct_keys = 0
	total_keys = 0
	correct_chars = 0
	over_reason = "time"
	over_t = 0.0
	emitted = false
	locked_id = -1
	pool = []
	last_word = ""
	last_right = 0.0
	lunge = 0.0
	lunge_target = 0.0
	jump_offset = 0.0
	jump_vy = 0.0
	airborne = false
	action = ""
	particles.clear()
	floats.clear()
	shake = 0.0
	shake_offset = Vector2.ZERO
	if crates_root != null:
		crates_root.position = Vector2.ZERO
	if fx != null:
		fx.position = Vector2.ZERO
	groups.clear()
	_clear_crates()
	hero.position = Vector2(HOME_X, _hero_base_y())
	hero.play("idle")
	spawn_opening()
	hud.setup(world_info, level, duration, max_hp)
	hud.show_phase("ready")
	hud.update_state(_hud_state())
	queue_redraw()

func _clear_crates() -> void:
	for child in crates_root.get_children():
		child.free()

func _free_group(g: Dictionary) -> void:
	var node = g.get("node")
	if node != null and is_instance_valid(node):
		node.queue_free()

func start_run() -> void:
	reset_run()
	sfx.ui()
	phase = "countdown"
	countdown = START_COUNTDOWN
	hud.show_phase(phase)
	queue_redraw()

func resume_run() -> void:
	if phase != "paused":
		return
	phase = "playing"
	sfx.ui()
	hud.show_phase(phase)

func toggle_pause() -> void:
	if phase == "playing":
		phase = "paused"
		sfx.ui()
		hud.show_phase(phase)
	elif phase == "paused":
		resume_run()

func end_game(reason: String) -> void:
	if phase == "over":
		return
	phase = "over"
	over_reason = reason
	shake = 6.0
	action = ""
	hero.play("idle")
	hud.show_phase(phase)
	hud.show_over(reason, _stats())
	queue_redraw()

func _emit_result() -> void:
	if emitted:
		return
	emitted = true
	var stats := _stats()
	var minutes := maxf(elapsed, 0.001) / 60.0
	var result := {
		"duniaId": dungeon_id,
		"level": level,
		"skor": int(score),
		"wpm": snappedf((correct_chars / 5.0) / minutes, 0.1) if correct_chars > 0 else 0.0,
		"akurasi": snappedf(float(stats["acc"]), 0.1),
		"comboTerpanjang": int(max_combo),
		"totalMusuhKalah": int(kills),
		"totalMusuhLolos": int(missed),
		"waktuMillis": int(round(elapsed * 1000.0)),
	}
	finished.emit(result)

func note(text: String) -> void:
	if hud != null:
		hud.set_over_note(text)

func _stats() -> Dictionary:
	var minutes := maxf(elapsed, 0.001) / 60.0
	return {
		"score": score,
		"wpm": int(correct_chars / 5.0 / minutes) if correct_chars > 0 else 0,
		"acc": int(round(float(correct_keys) / float(maxi(total_keys, 1)) * 100.0)) if total_keys > 0 else 100,
		"max_combo": max_combo,
		"kills": kills,
		"missed": missed,
	}

# ------------------------------------------------------------------ #
# Words, layout and spawning                                          #
# ------------------------------------------------------------------ #

func make_layout(word: String) -> Dictionary:
	var chars: Array = []
	for i in word.length():
		chars.append(word[i])
	var col_limit := 6
	var rows: Array = []
	for i in chars.size():
		var row := int(i / float(col_limit))
		while rows.size() <= row:
			rows.append([])
		rows[row].append(i)
	var rows_width: Array = []
	var total_width := 0.0
	for row_chars in rows:
		var w := 0.0
		for i in row_chars:
			w += 15.0 if chars[i] == " " else CELL
		w += CELL_GAP * float(row_chars.size() - 1)
		rows_width.append(w)
		total_width = maxf(total_width, w)
	var height := rows.size() * CELL + CELL_GAP * float(rows.size() - 1)
	var cells: Array = []
	cells.resize(chars.size())
	for row_index in rows.size():
		var row_chars: Array = rows[row_index]
		var cursor := (total_width - float(rows_width[row_index])) / 2.0
		for i in row_chars:
			var cw := 15.0 if chars[i] == " " else CELL
			cells[i] = Vector2(cursor + cw / 2.0, row_index * (CELL + CELL_GAP) + CELL / 2.0)
			cursor += cw + CELL_GAP
	return {"chars": chars, "cells": cells, "width": total_width, "height": height}

func pick_word() -> String:
	if pool.is_empty():
		var list := world_words.duplicate()
		if list.is_empty():
			list = WorldData.fallback_words(str(world_info.get("slug", "bahasa-inggris")), level)
		list.shuffle()
		if list.size() > 1 and str(list[list.size() - 1]) == last_word:
			var tmp = list[0]
			list[0] = list[list.size() - 1]
			list[list.size() - 1] = tmp
		pool = list
	var word := str(pool.pop_back()) if not pool.is_empty() else "word"
	last_word = word
	return word

func spawn_group(opening := false) -> void:
	var word := pick_word()
	var layout := make_layout(word)
	var width: float = float(layout["width"]) + PAD * 2.0
	var height: float = float(layout["height"])
	var gap := 40.0 if opening else 74.0
	var x := HOME_X + 152.0
	if not opening:
		x = cam_x + VIEW_W + 40.0
	for g in groups:
		x = maxf(x, float(g["x"]) + float(g["width"]) + gap)
	var tier_max := int(cfg["tier_max"])
	var by_height := int(floor((GROUND_Y - height - 52.0) / TIER_H))
	tier_max = clampi(by_height, 0, tier_max)
	var tier := 0
	if force_tier >= 0:
		tier = clampi(force_tier, 0, maxi(tier_max, 0))
	elif tier_max > 0:
		tier = randi() % (tier_max + 1)
	var surface := GROUND_Y - tier * TIER_H
	var top := surface - height

	var group := {
		"id": seq,
		"word": word,
		"chars": layout["chars"],
		"cells": layout["cells"],
		"typed": 0,
		"x": x,
		"width": width,
		"height": height,
		"tier": tier,
		"surface": surface,
		"top": top,
		"cleared": false,
	}
	seq += 1

	var node := Node2D.new()
	node.position = Vector2(x, top)
	crates_root.add_child(node)
	var letter_nodes: Array = []
	for i in group["chars"].size():
		var ch: String = group["chars"][i]
		var cell: Vector2 = group["cells"][i]
		var wrapper := Node2D.new()
		wrapper.position = cell
		node.add_child(wrapper)
		if ch == " ":
			var dash := ColorRect.new()
			dash.color = Color(1, 1, 1, 0.35)
			dash.size = Vector2(12, 3)
			dash.position = Vector2(-6, -1)
			dash.mouse_filter = Control.MOUSE_FILTER_IGNORE
			wrapper.add_child(dash)
		else:
			var sprite := Sprite2D.new()
			sprite.texture = load(str(world_info.get("crate", "res://art/mossy-crate-32-removebg-preview.png")))
			var art := 500.0
			sprite.scale = Vector2((CELL - 2.0) / art, (CELL - 2.0) / art)
			wrapper.add_child(sprite)
			var label := UiKit.label(ch, 13, Color("#FFF4D8"))
			label.size = Vector2(CELL, CELL)
			label.position = Vector2(-CELL / 2.0, -CELL / 2.0 + 1)
			label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
			label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
			label.mouse_filter = Control.MOUSE_FILTER_IGNORE
			wrapper.add_child(label)
		letter_nodes.append(wrapper)
	group["node"] = node
	group["letters"] = letter_nodes
	groups.append(group)
	last_right = x + width

func spawn_opening() -> void:
	last_right = 0.0
	for i in int(cfg["on_screen"]):
		spawn_group(true)

# ------------------------------------------------------------------ #
# Typing                                                              #
# ------------------------------------------------------------------ #

func _unhandled_key_input(event: InputEvent) -> void:
	if not (event is InputEventKey):
		return
	var key := event as InputEventKey
	if not key.pressed or key.echo:
		return
	if key.keycode == KEY_ESCAPE:
		if phase == "playing" or phase == "paused":
			get_viewport().set_input_as_handled()
			toggle_pause()
		return
	if key.keycode == KEY_ENTER or key.keycode == KEY_KP_ENTER:
		if phase == "ready":
			get_viewport().set_input_as_handled()
			start_run()
		elif phase == "paused":
			get_viewport().set_input_as_handled()
			resume_run()
		return
	if phase != "playing":
		return
	var ch := ""
	if key.unicode > 0:
		ch = char(key.unicode)
	elif key.keycode >= 32 and key.keycode < 127:
		ch = char(key.keycode)
	if ch.length() == 0 or ch == "\n" or ch == "\r" or ch == "\t":
		return
	get_viewport().set_input_as_handled()
	process_char(ch)

func active_group():
	if locked_id >= 0:
		for g in groups:
			if int(g["id"]) == locked_id and int(g["typed"]) < int(g["chars"].size()):
				return g
	var best = null
	for g in groups:
		if int(g["typed"]) < int(g["chars"].size()):
			if best == null or float(g["x"]) < float(best["x"]):
				best = g
	return best

func nearest_group():
	var best = null
	for g in groups:
		if int(g["typed"]) < int(g["chars"].size()):
			if best == null or float(g["x"]) < float(best["x"]):
				best = g
	return best

func process_char(raw: String) -> void:
	if phase != "playing":
		return
	if raw.length() != 1:
		return
	total_keys += 1
	var locked = null
	for g in groups:
		if int(g["id"]) == locked_id and int(g["typed"]) < int(g["chars"].size()):
			locked = g
			break
	if locked == null:
		var candidates: Array = []
		for g in groups:
			var typed := int(g["typed"])
			var chars: Array = g["chars"]
			if typed < chars.size() and WorldData.same_char(str(chars[typed]), raw):
				candidates.append(g)
		if candidates.is_empty():
			fail_char(nearest_group())
			return
		candidates.sort_custom(func(a, b): return float(a["x"]) < float(b["x"]))
		locked = candidates[0]
		locked_id = int(locked["id"])

	var typed_index := int(locked["typed"])
	var expected: String = str(locked["chars"][typed_index])
	if WorldData.same_char(expected, raw):
		hit_group(locked)
	else:
		fail_char(locked)

func hit_group(group: Dictionary) -> void:
	var index := int(group["typed"])
	var cell: Vector2 = group["cells"][index]
	var wx: float = float(group["x"]) + PAD + cell.x
	var wy: float = float(group["top"]) + cell.y
	locked_id = int(group["id"])
	correct_keys += 1
	correct_chars += 1
	group["typed"] = index + 1
	combo += 1
	max_combo = maxi(max_combo, combo)

	var mult := 3 if level == "HARD" else (2 if level == "MEDIUM" else 1)
	score += 2 * mult
	sfx.slash(combo % 6)

	var letters: Array = group["letters"]
	if index < letters.size():
		letters[index].visible = false
	_burst(wx, wy, Color("#F2C14E"), 5)
	if combo > 0 and combo % 10 == 0:
		_float(wx, wy - 30.0, "%d COMBO" % combo, Color("#FFE8A3"))

	var node: Node2D = group["node"]
	lunge_target = clampf(wx - HOME_X - 40.0, 0.0, 210.0)
	if int(group["tier"]) > 0 and not airborne:
		airborne = true
		jump_vy = sqrt(2.0 * GRAVITY * maxf(70.0, float(group["tier"]) * TIER_H * 0.85))
	action = "slash"
	action_t = 0.0
	hero.play("slash")

	var complete := int(group["typed"]) >= int(group["chars"].size())
	if complete:
		group["cleared"] = true
		locked_id = -1
		kills += 1
		var bonus := int(group["chars"].size()) * 8 * mult + int(combo / 10) * 5
		score += bonus
		_burst(wx, wy, Color("#FFF4C2"), 16)
		_float(wx, wy - 14, "+%d" % bonus, Color("#FFE08A"))
		shake = minf(8.0, shake + 2.0)
		sfx.kill()
		hero.play("slash")
	else:
		sfx.slash(combo % 6)

func fail_char(group) -> void:
	combo = 0
	shake = minf(8.0, shake + 2.5)
	action = "block"
	action_t = 0.0
	sfx.error()
	if group != null:
		group["wrong_at"] = time

# ------------------------------------------------------------------ #
# Frame update                                                       #
# ------------------------------------------------------------------ #

func _process(delta: float) -> void:
	if phase == "ready" or phase == "paused":
		time += delta
		_update_hero(delta)
		_fx_tick(delta)
		return

	time += delta
	_fx_tick(delta)
	_update_hero(delta)
	if shake > 0.0:
		shake = maxf(0.0, shake - delta * 22.0)
	var shake_on := bool(Profile.settings.get("screen_shake", true)) and not bool(Profile.settings.get("reduced_motion", false))
	if shake > 0.0 and shake_on:
		shake_offset = Vector2(randf_range(-shake, shake), randf_range(-shake, shake) * 0.5)
	else:
		shake_offset = Vector2.ZERO
	if crates_root != null:
		crates_root.position = shake_offset
	if fx != null:
		fx.position = shake_offset

	if phase == "countdown":
		countdown -= delta
		var count := maxi(1, int(ceil(countdown / 0.8)))
		if count != last_count:
			last_count = count
			sfx.countdown(count == 1)
		if countdown <= 0.0:
			phase = "playing"
			elapsed = 0.0
			hud.show_phase(phase)
		hud.update_state(_hud_state())
		queue_redraw()
		return

	if phase == "over":
		over_t += delta
		if over_t > 1.2:
			_emit_result()
		hud.update_state(_hud_state())
		queue_redraw()
		return

	# playing
	elapsed += delta
	cam_x += float(cfg["speed"]) * delta
	if bg_rect != null:
		var parallax := 0.0 if bool(Profile.settings.get("reduced_motion", false)) else minf(cam_x * 0.04, 30.0)
		bg_rect.position.x = -40.0 - parallax
	if elapsed >= duration:
		end_game("time")
		return

	for group in groups:
		group["x"] = float(group["x"]) - float(cfg["speed"]) * delta
		var node: Node2D = group["node"]
		node.position.x = float(group["x"])

	for group in groups.duplicate():
		if int(group["typed"]) >= int(group["chars"].size()):
			continue
		if float(group["x"]) + float(group["width"]) <= HOME_X + 10.0:
			_miss_group(group)

	var kept: Array = []
	for g in groups:
		if float(g["x"]) + float(g["width"]) < cam_x - 200.0:
			_free_group(g)
		else:
			kept.append(g)
	groups = kept

	var alive := 0
	for g in groups:
		if int(g["typed"]) < int(g["chars"].size()):
			alive += 1
	if alive < int(cfg["on_screen"]):
		spawn_group(false)

	hud.update_state(_hud_state())
	queue_redraw()

func _miss_group(group: Dictionary) -> void:
	group["typed"] = int(group["chars"].size())
	group["cleared"] = true
	for letter in group.get("letters", []):
		letter.visible = false
	if locked_id == int(group["id"]):
		locked_id = -1
	combo = 0
	missed += 1
	hp = maxi(0, hp - 1)
	shake = 8.0
	action = "block"
	action_t = 0.0
	_burst(float(group["x"]) + float(group["width"]) / 2.0, float(group["surface"]) - 20.0, Color("#E37B6B"), 12)
	_float(float(group["x"]) + float(group["width"]) / 2.0, float(group["surface"]) - 40.0, "MISS", Color("#FF8B7B"))
	sfx.miss()
	if hp <= 0:
		end_game("hp")

func _update_hero(delta: float) -> void:
	if airborne:
		jump_vy -= GRAVITY * delta
		jump_offset += jump_vy * delta
		if jump_offset <= 0.0:
			jump_offset = 0.0
			jump_vy = 0.0
			airborne = false
	if action == "slash" or action == "block":
		action_t += delta
		if action_t > (0.36 if action == "slash" else 0.22):
			action = ""
	if action == "slash":
		lunge = lerpf(lunge, lunge_target, minf(1.0, delta * 14.0))
	else:
		lunge = lerpf(lunge, 0.0, minf(1.0, delta * 6.0))
	hero.position = Vector2(HOME_X + lunge, _hero_base_y() - jump_offset) + shake_offset

func _fx_tick(delta: float) -> void:
	for p in particles:
		p["life"] += delta
		p["pos"] += p["vel"] * delta
		p["vel"].y += 620.0 * delta
	particles = particles.filter(func(p): return float(p["life"]) < float(p["max_life"]))
	for f in floats:
		f["life"] += delta
		f["pos"].y -= 34.0 * delta
	floats = floats.filter(func(f): return float(f["life"]) < float(f["max_life"]))
	if fx != null:
		fx.queue_redraw()

func _burst(px: float, py: float, color: Color, count: int, power := 150.0) -> void:
	for i in count:
		particles.append({
			"pos": Vector2(px, py),
			"vel": Vector2(randf_range(-0.5, 0.5) * power, -randf() * power - 30.0),
			"life": 0.0,
			"max_life": randf_range(0.25, 0.6),
			"color": color,
		})

func _float(px: float, py: float, text: String, color: Color) -> void:
	floats.append({"pos": Vector2(px, py), "text": text, "life": 0.0, "max_life": 0.9, "color": color})

func _hud_state() -> Dictionary:
	var group = active_group()
	var target_bbcode := ""
	var ratio := 0.0
	if group != null:
		var chars: Array = group["chars"]
		var typed := int(group["typed"])
		var start := maxi(0, typed - 8)
		var end := mini(chars.size(), typed + 20)
		var typed_color := "#79C8F2" if bool(Profile.settings.get("colorblind", false)) else "#5E8B6E"
		var parts: Array = []
		if start > 0:
			parts.append("[color=#5C6A78]…[/color]")
		for i in range(start, end):
			var ch: String = str(chars[i]).replace("[", "(").replace("]", ")")
			var glyph := "_" if ch == " " else ch
			if i == typed:
				parts.append("[bgcolor=#F2C14E][color=#171004] %s [/color][/bgcolor]" % glyph)
			elif i < typed:
				parts.append("[color=%s]%s[/color]" % [typed_color, glyph])
			else:
				parts.append("[color=#F5EFDF]%s[/color]" % glyph)
		if end < chars.size():
			parts.append("[color=#5C6A78]…[/color]")
		target_bbcode = "".join(parts)
		ratio = float(typed) / float(maxi(chars.size(), 1))
	var left := maxf(0.0, ceil(duration - elapsed))
	var state := {
		"score": score,
		"combo": combo,
		"wpm": _stats()["wpm"],
		"acc": _stats()["acc"],
		"hp": hp,
		"missed": missed,
		"level": level,
		"time_left": left,
		"time_ratio": clampf(left / maxf(duration, 1.0), 0.0, 1.0),
		"target_bbcode": target_bbcode,
		"target_ratio": ratio,
		"countdown": maxi(1, int(ceil(countdown / 0.8))),
	}
	return state

# ------------------------------------------------------------------ #
# Drawing: ground, cliffs, caret, hero shadow                         #
# ------------------------------------------------------------------ #

func _draw() -> void:
	var ground := Color(str(world_info.get("ground", "#7A5A3B")))
	var grass := Color(str(world_info.get("grass", "#6FA050")))
	var rock := Color(str(world_info.get("rock", "#8A7458")))
	var rock_dark := Color(str(world_info.get("rock_dark", "#64513A")))

	# Ground strip with scrolling pebbles.
	draw_rect(Rect2(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y), ground)
	draw_rect(Rect2(0, GROUND_Y, VIEW_W, 7), grass)
	draw_rect(Rect2(0, GROUND_Y + 7, VIEW_W, 2), grass.darkened(0.35))
	draw_rect(Rect2(0, GROUND_Y + 7, VIEW_W, 1), ground.darkened(0.4))
	var tile := 26.0
	var offset := -fmod(cam_x, tile)
	var col := 0
	while offset + col * tile < VIEW_W + tile:
		var x := offset + col * tile
		var seed := float(int((cam_x + x) / tile))
		if _hash01(seed) > 0.4:
			draw_rect(Rect2(x, GROUND_Y + 20, 10, 2), ground.darkened(0.3))
		if _hash01(seed * 3.1) > 0.55:
			draw_rect(Rect2(x + 6, GROUND_Y + 36, 5, 3), ground.lightened(0.12))
		if _hash01(seed * 7.7) > 0.5:
			var h := 3.0 + _hash01(seed * 2.3) * 5.0
			draw_rect(Rect2(x + 4, GROUND_Y - h, 2, h), grass)
			draw_rect(Rect2(x + 8, GROUND_Y - h - 2, 2, h + 2), grass)
		col += 1

	for group in groups:
		if int(group["tier"]) <= 0:
			continue
		var width: float = float(group["width"])
		var surface: float = float(group["surface"])
		var x0: float = float(group["x"])
		if x0 > VIEW_W + 60 or x0 + width < -60:
			continue
		var hgt := GROUND_Y - surface
		var gid := float(group["id"])
		draw_rect(Rect2(x0, surface, width, hgt), rock_dark.darkened(0.22))
		var bw := 24.0
		var bh := 13.0
		for r in int(ceil(hgt / bh)):
			var shift := 0.0 if r % 2 == 0 else bw * 0.5
			for c in range(-1, int(ceil(width / bw)) + 2):
				var bx := x0 + float(c) * bw + shift
				var by := surface + 4.0 + float(r) * bh
				var bx0 := maxf(bx, x0)
				var bx1 := minf(bx + bw - 1.0, x0 + width)
				var by1 := minf(by + bh - 1.0, GROUND_Y - 1.0)
				if bx1 - bx0 < 1.0 or by1 - by < 1.0:
					continue
				var tone := _hash01(gid + float(r) * 5.3 + float(c) * 1.7)
				var shade := rock.lightened(0.01 + tone * 0.07)
				if tone > 0.82:
					shade = shade.darkened(0.09)
				draw_rect(Rect2(bx0, by, bx1 - bx0, by1 - by), shade)
		draw_rect(Rect2(x0, surface, width, 2), rock.lightened(0.22))
		draw_rect(Rect2(x0, surface + 2, 3, hgt - 2), rock.lightened(0.06))
		draw_rect(Rect2(x0 + width - 4, surface + 2, 4, hgt - 2), rock_dark.darkened(0.12))
		draw_rect(Rect2(x0, GROUND_Y - 5, width, 5), rock_dark.darkened(0.28))
		for i in 3:
			var sy := surface + 8.0 + i * 18.0
			draw_rect(Rect2(x0 - 3, sy, 3, 7), rock.darkened(0.05))
			draw_rect(Rect2(x0 + width, sy + 5, 3, 7), rock_dark.darkened(0.1))
		for c in int(width / 22.0):
			var ch := _hash01(gid + c * 5.1)
			if ch > 0.55:
				var cx := x0 + 8 + c * 22 + ch * 6
				var cy := surface + 12 + _hash01(gid + c * 1.7) * maxf(4.0, hgt - 20.0)
				draw_rect(Rect2(cx, cy, 2, 4 + ch * 8), rock_dark.darkened(0.2))
		draw_rect(Rect2(x0 - 2, surface - 1, width + 4, 5), grass)
		draw_rect(Rect2(x0 - 2, surface + 4, width + 4, 2), grass.darkened(0.38))
		for i in int(width / 22.0):
			var mh := _hash01(gid + i * 1.3)
			if mh > 0.42:
				draw_rect(Rect2(x0 + 8 + i * 22, surface + 6, 3, 3 + mh * 8), grass.darkened(0.15))
		draw_rect(Rect2(x0, GROUND_Y - 7, width, 7), rock_dark.darkened(0.2))

	var hero_x := HOME_X + lunge
	draw_set_transform(Vector2(hero_x, GROUND_Y + 2.0), 0.0, Vector2(1.0, 0.22))
	draw_circle(Vector2.ZERO, 22.0, Color(0, 0, 0, 0.28))
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

	# Caret above the next letter of the locked group.
	var active = active_group()
	if active != null and phase == "playing":
		var typed := int(active["typed"])
		var cells: Array = active["cells"]
		if typed < cells.size():
			var cell: Vector2 = cells[typed]
			var cx: float = float(active["x"]) + PAD + cell.x
			var cy: float = float(active["top"]) + cell.y - CELL / 2.0 - 12.0
			var bob := sin(time * 7.0) * 2.0
			draw_colored_polygon(
				PackedVector2Array([
					Vector2(cx - 5, cy + bob),
					Vector2(cx + 5, cy + bob),
					Vector2(cx, cy + 8 + bob),
				]),
				Color("#F2C14E")
			)
	_draw_ambient()

func _draw_ambient() -> void:
	if bool(Profile.settings.get("reduced_motion", false)):
		return
	var kind := str(world_info.get("ambient", "leaves"))
	var tint := Color(str(world_info.get("ambient_color", "#C9D98A")))
	for i in 28:
		var h1 := _hash01(float(i) * 1.37 + 0.5)
		var h2 := _hash01(float(i) * 2.11 + 3.7)
		var h3 := _hash01(float(i) * 3.77 + 8.1)
		var px := 0.0
		var py := 0.0
		var sz := 2.0
		var alpha := 0.55
		match kind:
			"snow":
				px = fmod(h1 * 700.0 + time * (12.0 + h2 * 18.0), 680.0) - 20.0
				py = fmod(h2 * 360.0 + time * (26.0 + h3 * 30.0), 300.0)
				sz = 1.5 + h3 * 1.5
			"sand":
				px = fmod(h1 * 700.0 + time * (50.0 + h2 * 40.0), 700.0) - 30.0
				py = 258.0 + h2 * 42.0
				alpha = 0.32
			"petals":
				px = fmod(h1 * 700.0 + time * (10.0 + h2 * 14.0) + sin(time * 0.8 + h3 * 6.28) * 12.0, 680.0) - 20.0
				py = fmod(h2 * 340.0 + time * (18.0 + h3 * 20.0), 320.0)
				sz = 2.5
			"spray":
				px = fmod(h1 * 700.0 + time * (20.0 + h2 * 20.0), 680.0) - 20.0
				py = 290.0 - fmod(time * (8.0 + h3 * 10.0) + h2 * 40.0, 40.0)
				sz = 1.5
			"fireflies":
				px = 30.0 + h1 * 580.0 + sin(time * (0.4 + h2 * 0.5) + h3 * 6.28) * 14.0
				py = 190.0 + h2 * 100.0 + sin(time * (0.7 + h3 * 0.4) + h1 * 6.28) * 8.0
				alpha = 0.35 + 0.65 * absf(sin(time * (1.2 + h1) + h2 * 6.28))
				if alpha > 0.3:
					var glow := tint
					glow.a = alpha * 0.16
					draw_rect(Rect2(px - 3, py - 3, 8, 8), glow)
			_:
				px = fmod(h1 * 700.0 + time * (22.0 + h2 * 20.0), 680.0) - 20.0
				py = fmod(h2 * 340.0 + time * (18.0 + h3 * 22.0) + sin(time * (0.5 + h1) + h3 * 6.28) * 18.0, 330.0)
				sz = 2.0
		var col := tint
		col.a = alpha
		draw_rect(Rect2(px, py, sz, sz), col)

func _hash01(seed: float) -> float:
	var x := sin(seed * 127.1 + 311.7) * 43758.5453
	return x - floor(x)

func _notification(what: int) -> void:
	if what == NOTIFICATION_APPLICATION_FOCUS_OUT and phase == "playing":
		phase = "paused"
		if hud != null:
			hud.show_phase(phase)

# ------------------------------------------------------------------ #
# Test hooks                                                          #
# ------------------------------------------------------------------ #

func debug_start() -> void:
	start_run()
	phase = "playing"
	hud.show_phase(phase)

func debug_type(text: String) -> void:
	for i in text.length():
		process_char(text[i])

func debug_finish() -> void:
	end_game("time")
	_emit_result()

func debug_force_miss() -> void:
	var group = active_group()
	if group != null:
		_miss_group(group)

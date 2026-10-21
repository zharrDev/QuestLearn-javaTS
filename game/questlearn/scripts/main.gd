extends Control

const ARENA := preload("res://scripts/arena.gd")
const LEVELS := ["EASY", "MEDIUM", "HARD"]
const DURATIONS := [30, 60, 300]
const VERSION := "0.3.0"

var screen: Control
var screen_name := "title"
var worlds: Array = []
var selected_slug := "bahasa-indonesia"
var selected_id := -1
var selected_native := "Bahasa Indonesia"
var difficulty := "EASY"
var duration := 60
var cards: Dictionary = {}
var start_button: Button
var status_label: Label
var option_desc: Label
var arena: TypingArena
var shots_mode := false
var offline_mode := false
var settings_back := "title"
var login_busy := false

func _ready() -> void:
	theme = UiKit.theme()
	set_anchors_preset(Control.PRESET_FULL_RECT)
	for arg in OS.get_cmdline_user_args():
		if arg == "--shots":
			shots_mode = true
	difficulty = str(Profile.settings.get("last_level", "EASY"))
	duration = int(Profile.settings.get("last_duration", 60))
	selected_slug = str(Profile.settings.get("last_world", "bahasa-indonesia"))
	if shots_mode:
		_shots_flow()
	else:
		_show_title()

func _capture(shot_name: String) -> void:
	await RenderingServer.frame_post_draw
	var img := get_viewport().get_texture().get_image()
	var dir := "user://shots"
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(dir))
	var path := "%s/%s.png" % [dir, shot_name]
	img.save_png(path)
	print("SHOT " + ProjectSettings.globalize_path(path))

func _shots_flow() -> void:
	_show_title()
	await get_tree().create_timer(0.8).timeout
	await _capture("01-title")
	_show_settings("title")
	await get_tree().create_timer(0.6).timeout
	await _capture("01b-settings")
	_show_login()
	await get_tree().create_timer(0.6).timeout
	await _capture("01c-login")
	await _show_worlds()
	await get_tree().create_timer(0.8).timeout
	await _capture("02-worlds")
	var pick = null
	for w in worlds:
		if str(w.get("slug", "")) == "bahasa-indonesia":
			pick = w
			break
	if pick != null:
		_select_world(pick)
	_set_level("EASY")
	_set_duration(60)
	await _start_session()
	await get_tree().create_timer(0.6).timeout
	await _capture("03-ready")
	arena.force_tier = 1
	arena.start_run()
	await get_tree().create_timer(1.0).timeout
	await _capture("04-countdown")
	await get_tree().create_timer(2.0).timeout
	await _capture("05-playing")
	for i in 3:
		var group = arena.active_group()
		if group != null:
			arena.debug_type(str(group["word"]))
		await get_tree().create_timer(0.3).timeout
	await _capture("06-clearing")
	arena.toggle_pause()
	await get_tree().create_timer(0.3).timeout
	await _capture("07-paused")
	arena.resume_run()
	await get_tree().create_timer(0.2).timeout
	arena.end_game("time")
	await get_tree().create_timer(0.5).timeout
	await _capture("08-gameover")
	await get_tree().create_timer(2.8).timeout
	await _capture("09-result")
	print("SHOTS_DIR " + ProjectSettings.globalize_path("user://shots"))
	get_tree().quit()

func _clear_screen() -> void:
	if screen != null and is_instance_valid(screen):
		screen.visible = false
		screen.queue_free()
	screen = null

func _free_arena() -> void:
	if arena != null and is_instance_valid(arena):
		arena.queue_free()
	arena = null

func _new_screen(with_bg := true, world_info: Dictionary = {}) -> Control:
	_clear_screen()
	_free_arena()
	var c := Control.new()
	c.set_anchors_preset(Control.PRESET_FULL_RECT)
	c.theme = UiKit.theme()
	add_child(c)
	screen = c
	if with_bg:
		_add_menu_bg(c, world_info)
	return c

func _add_menu_bg(c: Control, world_info: Dictionary = {}) -> void:
	var info := world_info if not world_info.is_empty() else WorldData.info(str(Profile.settings.get("last_world", "bahasa-indonesia")))
	var bg := TextureRect.new()
	bg.texture = load(str(info.get("bg", "res://art/village-960x360.png")))
	bg.position = Vector2(-20, -10)
	bg.size = Vector2(680, 380)
	bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	bg.modulate = Color(str(info.get("bg_tint", "#FFFFFF")))
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.add_child(bg)
	var pan := bg.create_tween().set_loops()
	pan.tween_property(bg, "position:x", -46.0, 18.0).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	pan.tween_property(bg, "position:x", -20.0, 18.0).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	var shade := ColorRect.new()
	shade.color = Color(0.015, 0.03, 0.045, 0.66)
	shade.set_anchors_preset(Control.PRESET_FULL_RECT)
	shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.add_child(shade)
	c.add_child(UiKit.vignette(0.7))
	c.add_child(UiKit.scanlines())

func _toast(text: String, color := UiKit.ACCENT) -> void:
	if text.strip_edges() == "":
		return
	var panel := UiKit.panel(Color("#0B141B"), color.darkened(0.2))
	panel.position = Vector2(140, 16)
	panel.size = Vector2(360, 32)
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var l := UiKit.label(text, 7, color)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	panel.add_child(l)
	add_child(panel)
	panel.modulate.a = 0.0
	var tw := panel.create_tween()
	tw.tween_property(panel, "modulate:a", 1.0, 0.18)
	tw.tween_interval(2.0)
	tw.tween_property(panel, "modulate:a", 0.0, 0.3)
	tw.tween_callback(panel.queue_free)

# ------------------------------------------------------------------ #
# Title                                                               #
# ------------------------------------------------------------------ #

func _show_title() -> void:
	screen_name = "title"
	var c := _new_screen(true, WorldData.info(selected_slug))
	var badge := UiKit.chip(Profile.identity_label(), UiKit.GREEN_LIGHT)
	badge.position = Vector2(32, 26)
	c.add_child(badge)
	badge.reset_size()

	var logo := UiKit.display(Loc.t("app_title"), 22, UiKit.ACCENT)
	logo.position = Vector2(32, 74)
	c.add_child(logo)
	var sub := UiKit.display(Loc.t("app_subtitle"), 8, UiKit.GREEN_LIGHT)
	sub.position = Vector2(34, 110)
	c.add_child(sub)
	var tag := UiKit.label(Loc.t("tagline"), 9, UiKit.INK_SOFT)
	tag.position = Vector2(34, 134)
	c.add_child(tag)
	var rule := ColorRect.new()
	rule.color = UiKit.ACCENT
	rule.position = Vector2(34, 160)
	rule.size = Vector2(214, 2)
	rule.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.add_child(rule)

	var stats := HBoxContainer.new()
	stats.position = Vector2(32, 176)
	stats.add_theme_constant_override("separation", 8)
	c.add_child(stats)
	stats.add_child(UiKit.chip("%s  %d" % [Loc.t("best_wpm"), Profile.best_wpm()], UiKit.ACCENT, 6))
	stats.add_child(UiKit.chip("%s  %d" % [Loc.t("xp_total"), int(Profile.profile.get("xp", 0))], UiKit.GREEN_LIGHT, 6))
	stats.add_child(UiKit.chip("%s  %d" % [Loc.t("streak"), int(Profile.profile.get("streak", 1))], UiKit.BLUE, 6))

	var play := UiKit.primary(Loc.t("play"), 11)
	play.position = Vector2(34, 214)
	play.size = Vector2(236, 44)
	play.pressed.connect(_on_play_pressed)
	c.add_child(play)

	var login := UiKit.button(Loc.t("sign_out") if Api.is_logged_in() else Loc.t("sign_in"), 9, "ghost")
	login.position = Vector2(34, 264)
	login.size = Vector2(112, 32)
	login.pressed.connect(_on_account_pressed)
	c.add_child(login)
	var opts := UiKit.button(Loc.t("settings"), 8, "ghost")
	opts.position = Vector2(154, 264)
	opts.size = Vector2(116, 32)
	opts.pressed.connect(func() -> void: _show_settings("title"))
	c.add_child(opts)
	var quit := UiKit.button(Loc.t("quit"), 8, "ghost")
	quit.position = Vector2(34, 302)
	quit.size = Vector2(236, 28)
	quit.pressed.connect(func() -> void: get_tree().quit())
	c.add_child(quit)

	var card := UiKit.panel(Color("#0B141B"), Color(str(WorldData.info(selected_slug).get("accent", "#F2C14E"))))
	card.position = Vector2(356, 82)
	card.size = Vector2(248, 196)
	c.add_child(card)
	var hero := TextureRect.new()
	hero.texture = load("res://art/idle_01.png")
	hero.position = Vector2(382, 112)
	hero.size = Vector2(150, 132)
	hero.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	hero.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	hero.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.add_child(hero)
	var hero_bob := hero.create_tween().set_loops()
	hero_bob.tween_property(hero, "position:y", 106.0, 1.6).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	hero_bob.tween_property(hero, "position:y", 112.0, 1.6).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	var shadow := ColorRect.new()
	shadow.color = Color(0, 0, 0, 0.28)
	shadow.position = Vector2(414, 240)
	shadow.size = Vector2(86, 6)
	shadow.mouse_filter = Control.MOUSE_FILTER_IGNORE
	c.add_child(shadow)
	var world_name := UiKit.display(Loc.t(str(WorldData.info(selected_slug).get("motif_key", "world_id_motif"))), 7, Color(str(WorldData.info(selected_slug).get("accent", "#F2C14E"))))
	world_name.position = Vector2(546, 96)
	world_name.rotation = deg_to_rad(90)
	c.add_child(world_name)
	var foot := UiKit.label("v%s · GODOT 4.3" % VERSION, 6, UiKit.MUTED)
	foot.position = Vector2(34, 334)
	c.add_child(foot)
	var hint := UiKit.label(Loc.t("press_enter_title"), 6, UiKit.MUTED)
	hint.position = Vector2(356, 296)
	c.add_child(hint)
	tag.modulate.a = 1.0
	UiKit.fade_in(c, 0.28)

func _on_play_pressed() -> void:
	_show_worlds()

func _on_account_pressed() -> void:
	if Api.is_logged_in():
		Api.clear_session()
		_toast(Loc.t("sign_out"), UiKit.MUTED)
		_show_title()
	else:
		_show_login()

# ------------------------------------------------------------------ #
# Login                                                               #
# ------------------------------------------------------------------ #

func _show_login() -> void:
	screen_name = "login"
	var c := _new_screen(true, WorldData.info(selected_slug))
	var panel := UiKit.panel()
	panel.position = Vector2(130, 18)
	panel.size = Vector2(380, 324)
	c.add_child(panel)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 4)
	panel.add_child(box)

	var title := UiKit.display(Loc.t("sign_in"), 13, UiKit.ACCENT)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(title)
	var sub := UiKit.label(Loc.t("welcome_back"), 7, UiKit.MUTED)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(sub)

	box.add_child(UiKit.label(Loc.t("email"), 7, UiKit.MUTED))
	var email := LineEdit.new()
	email.placeholder_text = "siswa@demo.id"
	email.custom_minimum_size = Vector2(0, 30)
	box.add_child(email)
	box.add_child(UiKit.label(Loc.t("password"), 7, UiKit.MUTED))
	var password := LineEdit.new()
	password.secret = true
	password.placeholder_text = "demo123"
	password.custom_minimum_size = Vector2(0, 30)
	box.add_child(password)

	var error := UiKit.label("", 7, UiKit.RED)
	error.custom_minimum_size = Vector2(0, 16)
	box.add_child(error)

	var sign_in := UiKit.primary(Loc.t("sign_in"), 9)
	sign_in.custom_minimum_size = Vector2(0, 38)
	box.add_child(sign_in)
	var hint := UiKit.label(Loc.t("login_hint"), 6, UiKit.MUTED)
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(hint)
	var guest := UiKit.button(Loc.t("continue_guest"), 8, "ghost")
	guest.custom_minimum_size = Vector2(0, 30)
	guest.pressed.connect(func() -> void: _show_title())
	box.add_child(guest)
	var back := UiKit.button(Loc.t("back"), 7, "ghost")
	back.custom_minimum_size = Vector2(0, 26)
	back.pressed.connect(func() -> void: _show_title())
	box.add_child(back)

	var submit := func() -> void:
		if login_busy:
			return
		var mail := email.text.strip_edges()
		if mail == "" or password.text == "":
			error.text = Loc.t("login_required")
			return
		login_busy = true
		sign_in.disabled = true
		sign_in.text = Loc.t("signing_in")
		error.text = ""
		var res: Dictionary = await Api.login(mail, password.text)
		login_busy = false
		if res["ok"]:
			await _flush_pending()
			_show_worlds()
		else:
			sign_in.disabled = false
			sign_in.text = Loc.t("sign_in")
			error.text = Loc.tf("login_failed", [str(res["message"])])
	sign_in.pressed.connect(submit)
	password.text_submitted.connect(func(_value: String) -> void: submit.call())
	email.text_submitted.connect(func(_value: String) -> void: password.grab_focus())
	email.grab_focus()
	UiKit.fade_in(c, 0.25)

func _flush_pending() -> void:
	if not Api.is_logged_in():
		return
	var items: Array = Profile.take_pending()
	for item in items:
		var res: Dictionary = await Api.submit_typing(item)
		if res["ok"] and typeof(res["data"]) == TYPE_DICTIONARY:
			Profile.add_xp(int(res["data"].get("xpDidapat", 0)))
		else:
			Profile.queue_run(item)

# ------------------------------------------------------------------ #
# World select                                                        #
# ------------------------------------------------------------------ #

func _show_worlds() -> void:
	screen_name = "worlds"
	var world_hint := WorldData.info(selected_slug)
	var c := _new_screen(true, world_hint)
	var loading := UiKit.label(Loc.t("loading_worlds"), 10, UiKit.ACCENT)
	loading.position = Vector2(26, 140)
	c.add_child(loading)

	worlds = []
	offline_mode = not Api.is_logged_in()
	if Api.is_logged_in():
		var res: Dictionary = await Api.worlds()
		if res["ok"] and typeof(res["data"]) == TYPE_ARRAY:
			for w in res["data"]:
				if typeof(w) == TYPE_DICTIONARY and WorldData.WORLDS.has(str(w.get("slug", ""))):
					if bool(w.get("isActive", true)):
						worlds.append(w)
		if worlds.is_empty():
			offline_mode = true
	if worlds.is_empty():
		worlds = WorldData.guest_worlds()
		offline_mode = true
	if not is_instance_valid(c) or screen != c:
		return
	loading.queue_free()
	_build_world_header(c)
	_build_world_grid(c)
	_build_options(c)
	var picked = _find_world(selected_slug)
	if picked == null and not worlds.is_empty():
		picked = worlds[0]
		selected_slug = str(picked.get("slug", "bahasa-indonesia"))
	if picked != null:
		_select_world(picked)
	if offline_mode and Api.is_logged_in():
		_toast(Loc.t("offline_notice"), UiKit.RED)
	UiKit.fade_in(c, 0.22)

func _build_world_header(c: Control) -> void:
	var title := UiKit.display(Loc.t("choose_language"), 13, UiKit.ACCENT)
	title.position = Vector2(26, 12)
	c.add_child(title)
	var sub := UiKit.label(Loc.t("choose_world_sub"), 7, UiKit.INK_SOFT)
	sub.position = Vector2(26, 38)
	c.add_child(sub)
	var mode_text := Loc.t("guest")
	var mode_color := UiKit.BLUE
	if Api.is_logged_in():
		mode_text = Loc.t("offline_mode") if offline_mode else Loc.t("online")
		mode_color = UiKit.RED if offline_mode else UiKit.GREEN_LIGHT
	var guest_chip := UiKit.chip(mode_text, mode_color, 6)
	guest_chip.position = Vector2(336, 10)
	c.add_child(guest_chip)
	guest_chip.reset_size()

	var stats := HBoxContainer.new()
	stats.position = Vector2(336, 38)
	stats.add_theme_constant_override("separation", 6)
	c.add_child(stats)
	stats.add_child(UiKit.chip("%s %d" % [Loc.t("best"), Profile.best_wpm()], UiKit.ACCENT, 6))
	stats.add_child(UiKit.chip("%s %d" % [Loc.t("xp_total"), int(Profile.profile.get("xp", 0))], UiKit.GREEN_LIGHT, 6))
	stats.add_child(UiKit.chip("%s %d" % [Loc.t("streak"), int(Profile.profile.get("streak", 1))], UiKit.BLUE, 6))

	var opts := UiKit.button(Loc.t("settings"), 7, "ghost")
	opts.position = Vector2(448, 10)
	opts.size = Vector2(84, 24)
	opts.pressed.connect(func() -> void: _show_settings("worlds"))
	c.add_child(opts)
	var account := UiKit.button(Loc.t("sign_out") if Api.is_logged_in() else Loc.t("sign_in"), 7, "ghost")
	account.position = Vector2(538, 10)
	account.size = Vector2(78, 24)
	account.pressed.connect(_on_account_pressed)
	c.add_child(account)

func _build_world_grid(c: Control) -> void:
	var grid := GridContainer.new()
	grid.columns = 3
	grid.add_theme_constant_override("h_separation", 8)
	grid.add_theme_constant_override("v_separation", 8)
	grid.position = Vector2(26, 74)
	grid.size = Vector2(588, 172)
	c.add_child(grid)
	for w in worlds:
		var slug := str(w.get("slug", ""))
		var info := WorldData.info(slug)
		var accent := Color(str(info.get("accent", "#F2C14E")))
		var card := Button.new()
		card.custom_minimum_size = Vector2(190, 82)
		card.clip_contents = true
		card.focus_mode = Control.FOCUS_NONE
		card.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
		grid.add_child(card)
		var bg := TextureRect.new()
		bg.texture = load(str(info.get("bg", "res://art/village-960x360.png")))
		bg.position = Vector2.ZERO
		bg.size = Vector2(190, 82)
		bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
		bg.modulate = Color(str(info.get("bg_tint", "#FFFFFF"))) * Color(0.92, 0.92, 0.92, 1.0)
		bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
		card.add_child(bg)
		var veil := ColorRect.new()
		veil.color = Color(0.02, 0.03, 0.05, 0.44)
		veil.size = Vector2(190, 82)
		veil.mouse_filter = Control.MOUSE_FILTER_IGNORE
		card.add_child(veil)
		var bar := ColorRect.new()
		bar.color = accent
		bar.position = Vector2(0, 79)
		bar.size = Vector2(190, 3)
		bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
		card.add_child(bar)
		var code := UiKit.keycap(str(info.get("code", "EN")), accent)
		code.position = Vector2(8, 7)
		card.add_child(code)
		code.reset_size()
		var best := UiKit.label("%s %d" % [Loc.t("best"), Profile.best_wpm(slug)], 6, UiKit.ACCENT_SOFT)
		best.position = Vector2(92, 10)
		best.size = Vector2(90, 14)
		best.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		card.add_child(best)
		var name_label := UiKit.label(str(info.get("native", slug)), 9, UiKit.INK)
		name_label.position = Vector2(8, 27)
		card.add_child(name_label)
		var tagline := UiKit.label(Loc.t(str(info.get("tagline_key", ""))), 6, UiKit.INK_SOFT)
		tagline.position = Vector2(8, 48)
		card.add_child(tagline)
		card.pressed.connect(func() -> void: _select_world(w))
		cards[slug] = card

func _find_world(slug: String):
	for w in worlds:
		if str(w.get("slug", "")) == slug:
			return w
	return null

func _style_card(card: Button, selected: bool, accent: Color) -> void:
	if selected:
		card.add_theme_stylebox_override("normal", UiKit.box(Color("#13212C"), accent, 2, 0, 0))
		card.add_theme_stylebox_override("hover", UiKit.box(Color("#172735"), accent.lightened(0.2), 2, 0, 0))
		card.add_theme_stylebox_override("pressed", UiKit.box(Color("#0E1A22"), accent, 2, 0, 0))
	else:
		card.add_theme_stylebox_override("normal", UiKit.box(Color("#0D171F"), Color("#2A3742"), 1, 0, 0))
		card.add_theme_stylebox_override("hover", UiKit.box(Color("#13212C"), Color("#5B6D7C"), 2, 0, 0))
		card.add_theme_stylebox_override("pressed", UiKit.box(Color("#0D171F"), accent, 2, 0, 0))

func _select_world(w) -> void:
	selected_slug = str(w.get("slug", ""))
	selected_id = int(w.get("id", WorldData.info(selected_slug).get("id", -1)))
	var info := WorldData.info(selected_slug)
	selected_native = str(info.get("native", selected_slug))
	for slug in cards:
		_style_card(cards[slug], slug == selected_slug, Color(str(WorldData.info(slug).get("accent", "#F2C14E"))))
	if start_button != null:
		start_button.disabled = selected_id < 0
		_refresh_start_label()
	Profile.set_setting("last_world", selected_slug)

func _build_options(c: Control) -> void:
	var diff_label := UiKit.label(Loc.t("difficulty"), 8, UiKit.ACCENT_SOFT)
	diff_label.position = Vector2(26, 250)
	c.add_child(diff_label)
	var diff_row := HBoxContainer.new()
	diff_row.position = Vector2(116, 246)
	diff_row.add_theme_constant_override("separation", 6)
	c.add_child(diff_row)
	for lv in LEVELS:
		var b := UiKit.button(Loc.t(lv.to_lower()), 7)
		b.custom_minimum_size = Vector2(78, 26)
		b.name = "lv_" + lv
		b.pressed.connect(func() -> void: _set_level(lv))
		diff_row.add_child(b)

	var dur_label := UiKit.label(Loc.t("session"), 8, UiKit.ACCENT_SOFT)
	dur_label.position = Vector2(26, 280)
	c.add_child(dur_label)
	var dur_row := HBoxContainer.new()
	dur_row.position = Vector2(116, 276)
	dur_row.add_theme_constant_override("separation", 6)
	c.add_child(dur_row)
	for secs in DURATIONS:
		var b := UiKit.button(_duration_label(secs), 7)
		b.custom_minimum_size = Vector2(78, 26)
		b.name = "dur_%d" % secs
		b.pressed.connect(func() -> void: _set_duration(secs))
		dur_row.add_child(b)

	option_desc = UiKit.label("", 6, UiKit.MUTED)
	option_desc.position = Vector2(26, 308)
	c.add_child(option_desc)
	status_label = UiKit.label("", 7, UiKit.RED)
	status_label.position = Vector2(26, 322)
	c.add_child(status_label)

	start_button = UiKit.primary(Loc.tf("start_run_level", [Loc.t(difficulty.to_lower())]), 10)
	start_button.position = Vector2(392, 248)
	start_button.size = Vector2(224, 54)
	start_button.pressed.connect(func() -> void: await _start_session())
	c.add_child(start_button)

	var foot := UiKit.label(Loc.t("press_enter") + " · " + Loc.t("tip_accent"), 6, UiKit.MUTED)
	foot.position = Vector2(26, 338)
	c.add_child(foot)
	_refresh_option_buttons()
	_refresh_start_label()

func _duration_label(secs: int) -> String:
	if secs < 60:
		return Loc.tf("sec", [secs])
	if secs == 60:
		return Loc.tf("min", [1])
	return Loc.tf("min", [int(secs / 60)])

func _set_level(lv: String) -> void:
	difficulty = lv
	Profile.set_setting("last_level", lv)
	_refresh_option_buttons()
	_refresh_start_label()

func _set_duration(secs: int) -> void:
	duration = secs
	Profile.set_setting("last_duration", secs)
	_refresh_option_buttons()

func _refresh_option_buttons() -> void:
	if screen == null:
		return
	for lv in LEVELS:
		var b := screen.find_child("lv_" + lv, true, false) as Button
		if b != null:
			_style_option(b, lv == difficulty, Color("#7DDC8F"))
	for secs in DURATIONS:
		var b := screen.find_child("dur_%d" % secs, true, false) as Button
		if b != null:
			_style_option(b, secs == duration, Color("#79C8F2"))
	if option_desc != null:
		var key := "easy_desc"
		if difficulty == "MEDIUM":
			key = "medium_desc"
		elif difficulty == "HARD":
			key = "hard_desc"
		option_desc.text = Loc.t(key)

func _style_option(b: Button, active: bool, accent: Color) -> void:
	if active:
		b.add_theme_stylebox_override("normal", UiKit.box(accent.darkened(0.72), accent, 2, 8, 4))
		b.add_theme_color_override("font_color", accent)
	else:
		b.add_theme_stylebox_override("normal", UiKit.box(UiKit.PANEL_BG, Color("#2A3444"), 2, 8, 4))
		b.add_theme_color_override("font_color", UiKit.MUTED)

func _refresh_start_label() -> void:
	if start_button == null:
		return
	start_button.text = Loc.tf("start_run_level", [Loc.t(difficulty.to_lower())])

# ------------------------------------------------------------------ #
# Session                                                             #
# ------------------------------------------------------------------ #

func _local_session() -> Dictionary:
	var base := WorldData.fallback_words(selected_slug, difficulty)
	var words: Array = []
	while words.size() < 30:
		var batch := base.duplicate()
		batch.shuffle()
		words.append_array(batch)
	words = words.slice(0, 30)
	return {
		"sessionId": Time.get_ticks_msec(),
		"words": words,
		"totalWords": words.size(),
		"level": difficulty,
		"duniaId": selected_id,
		"duniaSlug": selected_slug,
		"duniaNama": selected_native,
	}

func _start_session() -> void:
	if selected_id < 0:
		return
	if start_button != null and is_instance_valid(start_button) and start_button.disabled and not screen_name == "result":
		return
	if start_button != null and is_instance_valid(start_button):
		start_button.disabled = true
		start_button.text = Loc.t("loading")
	if status_label != null and is_instance_valid(status_label):
		status_label.text = ""
	var session: Dictionary = {}
	if Api.is_logged_in():
		var res: Dictionary = await Api.start_typing(selected_id, difficulty)
		if res["ok"] and typeof(res["data"]) == TYPE_DICTIONARY:
			session = res["data"]
		else:
			session = _local_session()
			_toast(Loc.t("offline_notice"), UiKit.RED)
	else:
		session = _local_session()
	if start_button != null and is_instance_valid(start_button):
		start_button.disabled = false
		_refresh_start_label()
	if session.is_empty() or not session.has("words"):
		if status_label != null and is_instance_valid(status_label):
			status_label.text = Loc.t("offline_notice")
		return
	session["duniaId"] = int(session.get("duniaId", selected_id))
	session["duniaSlug"] = selected_slug
	session["duniaNama"] = selected_native
	session["level"] = difficulty
	Profile.set_setting("last_world", selected_slug)
	_open_arena(session)

func _open_arena(session: Dictionary) -> void:
	_clear_screen()
	_free_arena()
	screen_name = "arena"
	var info := WorldData.info(selected_slug)
	arena = ARENA.new()
	arena.setup(session, difficulty, float(duration), info)
	arena.finished.connect(_on_run_finished)
	add_child(arena)
	arena.modulate.a = 0.0
	UiKit.fade_in(arena, 0.3)

func _local_xp(result: Dictionary) -> int:
	var base := int(result.get("totalMusuhKalah", 0)) * 10
	var wpm_bonus := int(float(result.get("wpm", 0.0)) * 2.0)
	var acc := float(result.get("akurasi", 0.0))
	var acc_bonus := 20 if acc >= 90.0 else (10 if acc >= 75.0 else 0)
	var combo_bonus := int(result.get("comboTerpanjang", 0)) * 2
	var mult := 3 if difficulty == "HARD" else (2 if difficulty == "MEDIUM" else 1)
	return (base + wpm_bonus + acc_bonus + combo_bonus) * mult

func _on_run_finished(result: Dictionary) -> void:
	result["duniaSlug"] = selected_slug
	result["duniaNama"] = selected_native
	var record: Dictionary = Profile.record_run(result)
	var saved := false
	var xp := _local_xp(result)
	if Api.is_logged_in():
		var res: Dictionary = await Api.submit_typing(result)
		saved = bool(res["ok"])
		if saved and typeof(res["data"]) == TYPE_DICTIONARY:
			xp = int(res["data"].get("xpDidapat", xp))
		else:
			Profile.queue_run(result)
			_toast(Loc.t("run_not_saved"), UiKit.RED)
	Profile.add_xp(xp)
	_show_result(result, saved, xp, bool(record.get("new_best", false)))

# ------------------------------------------------------------------ #
# Result                                                              #
# ------------------------------------------------------------------ #

func _rank_for(result: Dictionary) -> String:
	var acc := float(result.get("akurasi", 0.0))
	var wpm := float(result.get("wpm", 0.0))
	if acc >= 98.0 and wpm >= 35.0:
		return "S"
	if acc >= 94.0:
		return "A"
	if acc >= 85.0:
		return "B"
	return "C"

func _rank_label(rank: String) -> String:
	match rank:
		"S":
			return Loc.t("perfect")
		"A":
			return Loc.t("great")
		"B":
			return Loc.t("good")
		_:
			return Loc.t("keep_going")

func _rank_color(rank: String) -> Color:
	match rank:
		"S":
			return UiKit.ACCENT
		"A":
			return UiKit.GREEN_LIGHT
		"B":
			return UiKit.BLUE
		_:
			return UiKit.PURPLE

func _show_result(result: Dictionary, saved: bool, xp: int, new_best: bool) -> void:
	screen_name = "result"
	_free_arena()
	var c := _new_screen(true, WorldData.info(selected_slug))
	var panel := UiKit.panel()
	panel.position = Vector2(100, 22)
	panel.size = Vector2(440, 316)
	c.add_child(panel)
	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", 5)
	panel.add_child(root)
	var title := UiKit.display(Loc.t("run_complete"), 14, UiKit.GREEN_LIGHT)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(title)
	var meta := UiKit.label("%s · %s" % [selected_native, Loc.t(difficulty.to_lower())], 7, UiKit.ACCENT_SOFT)
	meta.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(meta)

	var main_row := HBoxContainer.new()
	main_row.add_theme_constant_override("separation", 12)
	root.add_child(main_row)
	var rank := _rank_for(result)
	var rank_box := UiKit.panel(Color("#0B141B"), _rank_color(rank))
	rank_box.custom_minimum_size = Vector2(96, 108)
	main_row.add_child(rank_box)
	var rank_inner := VBoxContainer.new()
	rank_inner.alignment = BoxContainer.ALIGNMENT_CENTER
	rank_box.add_child(rank_inner)
	var rank_letter := UiKit.display(rank, 34, _rank_color(rank))
	rank_letter.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	rank_inner.add_child(rank_letter)
	var rank_word := UiKit.label(_rank_label(rank), 6, _rank_color(rank))
	rank_word.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	rank_inner.add_child(rank_word)

	var stats := VBoxContainer.new()
	stats.add_theme_constant_override("separation", 1)
	stats.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	main_row.add_child(stats)
	stats.add_child(UiKit.stat_row(Loc.t("score"), str(result.get("skor", 0)), UiKit.ACCENT))
	stats.add_child(UiKit.stat_row(Loc.t("wpm"), str(int(round(float(result.get("wpm", 0.0))))), UiKit.GREEN_LIGHT))
	stats.add_child(UiKit.stat_row(Loc.t("accuracy"), "%d%%" % int(float(result.get("akurasi", 0.0))), UiKit.BLUE))
	stats.add_child(UiKit.stat_row(Loc.t("best_combo"), str(result.get("comboTerpanjang", 0)), UiKit.ACCENT_SOFT))
	stats.add_child(UiKit.stat_row(Loc.t("words_cleared"), str(result.get("totalMusuhKalah", 0)), UiKit.INK_SOFT))
	stats.add_child(UiKit.stat_row(Loc.t("words_missed"), str(result.get("totalMusuhLolos", 0)), UiKit.RED))

	var xp_row := HBoxContainer.new()
	xp_row.add_theme_constant_override("separation", 8)
	root.add_child(xp_row)
	var xp_label := UiKit.display(Loc.tf("xp_gained", [xp]), 12, UiKit.ACCENT)
	xp_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	xp_row.add_child(xp_label)
	if new_best:
		xp_row.add_child(UiKit.chip(Loc.t("new_record"), UiKit.GREEN_LIGHT, 6))
	if saved:
		xp_row.add_child(UiKit.chip(Loc.t("run_saved"), UiKit.GREEN_LIGHT, 6))
	else:
		xp_row.add_child(UiKit.chip(Loc.t("run_not_saved"), UiKit.MUTED, 6))

	var note_key := "guest_notice"
	if Api.is_logged_in():
		note_key = "run_saved_account" if saved else "run_not_saved"
	var note := UiKit.label(Loc.t(note_key), 6, UiKit.MUTED)
	note.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(note)

	var buttons := HBoxContainer.new()
	buttons.add_theme_constant_override("separation", 6)
	root.add_child(buttons)
	var again := UiKit.primary(Loc.t("play_again"), 9)
	again.custom_minimum_size = Vector2(146, 34)
	again.pressed.connect(func() -> void: await _start_session())
	buttons.add_child(again)
	var change := UiKit.button(Loc.t("change_world"), 8, "ghost")
	change.custom_minimum_size = Vector2(126, 34)
	change.pressed.connect(func() -> void: _show_worlds())
	buttons.add_child(change)
	var home := UiKit.button(Loc.t("exit_to_title"), 8, "ghost")
	home.custom_minimum_size = Vector2(108, 34)
	home.pressed.connect(func() -> void: _show_title())
	buttons.add_child(home)
	var hint := UiKit.label(Loc.t("result_hint"), 6, UiKit.MUTED)
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	root.add_child(hint)
	UiKit.fade_in(c, 0.3)

# ------------------------------------------------------------------ #
# Settings                                                           #
# ------------------------------------------------------------------ #

func _show_settings(return_to: String) -> void:
	screen_name = "settings"
	settings_back = return_to
	var c := _new_screen(true, WorldData.info(selected_slug))
	var panel := UiKit.panel()
	panel.position = Vector2(54, 18)
	panel.size = Vector2(532, 324)
	c.add_child(panel)
	var root := VBoxContainer.new()
	root.add_theme_constant_override("separation", 6)
	panel.add_child(root)
	var head := HBoxContainer.new()
	root.add_child(head)
	var title := UiKit.display(Loc.t("settings"), 13, UiKit.ACCENT)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(title)
	var back := UiKit.button(Loc.t("back"), 7, "ghost")
	back.custom_minimum_size = Vector2(74, 26)
	back.pressed.connect(_back_from_settings)
	head.add_child(back)

	var cols := HBoxContainer.new()
	cols.add_theme_constant_override("separation", 18)
	root.add_child(cols)
	var left := VBoxContainer.new()
	left.custom_minimum_size = Vector2(236, 0)
	left.add_theme_constant_override("separation", 4)
	cols.add_child(left)
	var right := VBoxContainer.new()
	right.custom_minimum_size = Vector2(236, 0)
	right.add_theme_constant_override("separation", 4)
	cols.add_child(right)

	left.add_child(UiKit.label(Loc.t("audio"), 8, UiKit.GREEN_LIGHT))
	_add_slider(left, Loc.t("master"), "master_volume")
	_add_slider(left, Loc.t("music"), "music_volume")
	_add_slider(left, Loc.t("sfx"), "sfx_volume")
	left.add_child(UiKit.spacer(4))
	left.add_child(UiKit.label(Loc.t("your_name"), 8, UiKit.GREEN_LIGHT))
	var name_row := HBoxContainer.new()
	name_row.add_theme_constant_override("separation", 6)
	left.add_child(name_row)
	var name_edit := LineEdit.new()
	name_edit.text = str(Profile.settings.get("guest_name", "Pemain Baru"))
	name_edit.max_length = 16
	name_edit.custom_minimum_size = Vector2(150, 28)
	name_row.add_child(name_edit)
	var save_name := UiKit.button(Loc.t("save"), 7, "ghost")
	save_name.custom_minimum_size = Vector2(62, 28)
	save_name.pressed.connect(func() -> void:
		var value := name_edit.text.strip_edges()
		if value != "":
			Profile.set_setting("guest_name", value)
			_toast(Loc.t("saved"), UiKit.GREEN_LIGHT)
	)
	name_row.add_child(save_name)
	left.add_child(UiKit.spacer(4))
	left.add_child(UiKit.label(Loc.t("controls"), 8, UiKit.GREEN_LIGHT))
	left.add_child(UiKit.label(Loc.t("controls_1"), 7, UiKit.MUTED))
	left.add_child(UiKit.label(Loc.t("controls_2"), 7, UiKit.MUTED))

	right.add_child(UiKit.label(Loc.t("display"), 8, UiKit.GREEN_LIGHT))
	_add_toggle(right, Loc.t("fullscreen"), "fullscreen")
	_add_toggle(right, Loc.t("screen_shake"), "screen_shake")
	_add_toggle(right, Loc.t("reduced_motion"), "reduced_motion")
	_add_toggle(right, Loc.t("colorblind"), "colorblind")
	right.add_child(UiKit.spacer(2))
	right.add_child(UiKit.label(Loc.t("language"), 8, UiKit.GREEN_LIGHT))
	var lang_row := HBoxContainer.new()
	lang_row.add_theme_constant_override("separation", 6)
	right.add_child(lang_row)
	for code in ["id", "en"]:
		var b := UiKit.button("BAHASA INDONESIA" if code == "id" else "ENGLISH", 6, "ghost")
		b.custom_minimum_size = Vector2(112, 26)
		_style_option(b, Loc.locale == code, UiKit.ACCENT)
		b.pressed.connect(func() -> void:
			Profile.set_setting("language", code)
			_show_settings(settings_back)
		)
		lang_row.add_child(b)

	var foot := HBoxContainer.new()
	foot.add_theme_constant_override("separation", 8)
	root.add_child(foot)
	var reset := UiKit.button(Loc.t("reset_progress"), 6, "danger")
	reset.custom_minimum_size = Vector2(150, 26)
	reset.pressed.connect(_confirm_reset)
	foot.add_child(reset)
	var credits := UiKit.label(Loc.t("credits") + " · v" + VERSION, 6, UiKit.MUTED)
	credits.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	credits.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	foot.add_child(credits)
	UiKit.fade_in(c, 0.22)

func _add_slider(parent: Control, text: String, key: String) -> void:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 6)
	parent.add_child(row)
	var l := UiKit.label(text, 7, UiKit.MUTED)
	l.custom_minimum_size = Vector2(58, 0)
	row.add_child(l)
	var slider := HSlider.new()
	slider.min_value = 0
	slider.max_value = 100
	slider.step = 5
	slider.value = float(Profile.settings.get(key, 80))
	slider.custom_minimum_size = Vector2(120, 20)
	slider.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	slider.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	slider.add_theme_icon_override("grabber", UiKit.slider_grabber())
	slider.add_theme_icon_override("grabber_highlight", UiKit.slider_grabber(UiKit.ACCENT_SOFT))
	slider.add_theme_stylebox_override("slider", UiKit.box(Color("#060C12"), Color("#33424E"), 1, 0, 2))
	slider.add_theme_stylebox_override("grabber_area", UiKit.box(UiKit.GREEN, UiKit.GREEN, 0, 0, 2))
	slider.add_theme_stylebox_override("grabber_area_highlight", UiKit.box(UiKit.GREEN_LIGHT, UiKit.GREEN_LIGHT, 0, 0, 2))
	row.add_child(slider)
	var value := UiKit.label(str(int(slider.value)), 7, UiKit.ACCENT)
	value.custom_minimum_size = Vector2(30, 0)
	value.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	row.add_child(value)
	slider.value_changed.connect(func(v: float) -> void:
		value.text = str(int(v))
		Profile.set_setting(key, int(v))
	)

func _add_toggle(parent: Control, text: String, key: String) -> void:
	var b := UiKit.button("", 7, "ghost")
	b.custom_minimum_size = Vector2(0, 26)
	b.alignment = HORIZONTAL_ALIGNMENT_LEFT
	var state := bool(Profile.settings.get(key, false))
	b.text = "%s   %s" % [text, Loc.t("on") if state else Loc.t("off")]
	b.add_theme_color_override("font_color", UiKit.GREEN_LIGHT if state else UiKit.MUTED)
	b.pressed.connect(func() -> void:
		var next := Profile.toggle_setting(key)
		b.text = "%s   %s" % [text, Loc.t("on") if next else Loc.t("off")]
		b.add_theme_color_override("font_color", UiKit.GREEN_LIGHT if next else UiKit.MUTED)
	)
	parent.add_child(b)

func _confirm_reset() -> void:
	var dialog := ConfirmationDialog.new()
	dialog.title = Loc.t("reset_progress")
	dialog.dialog_text = Loc.t("reset_confirm")
	dialog.dialog_autowrap = true
	dialog.ok_button_text = Loc.t("reset")
	dialog.cancel_button_text = Loc.t("back")
	dialog.theme = UiKit.theme()
	dialog.confirmed.connect(func() -> void:
		Profile.reset_progress()
		_toast(Loc.t("reset_done"), UiKit.RED)
	)
	dialog.confirmed.connect(dialog.queue_free)
	dialog.canceled.connect(dialog.queue_free)
	add_child(dialog)
	dialog.popup_centered(Vector2i(400, 164))

func _back_from_settings() -> void:
	if settings_back == "worlds":
		_show_worlds()
	else:
		_show_title()

# ------------------------------------------------------------------ #
# Global input                                                        #
# ------------------------------------------------------------------ #

func _unhandled_key_input(event: InputEvent) -> void:
	if not (event is InputEventKey):
		return
	var key := event as InputEventKey
	if not key.pressed or key.echo:
		return
	if key.keycode == KEY_ESCAPE:
		if screen_name == "settings":
			_back_from_settings()
			get_viewport().set_input_as_handled()
		elif screen_name == "login" or screen_name == "worlds" or screen_name == "result":
			_show_title()
			get_viewport().set_input_as_handled()
		return
	if key.keycode == KEY_ENTER or key.keycode == KEY_KP_ENTER:
		if screen_name == "title":
			_on_play_pressed()
			get_viewport().set_input_as_handled()
		elif screen_name == "settings":
			_back_from_settings()
			get_viewport().set_input_as_handled()
		elif screen_name == "result":
			await _start_session()
			get_viewport().set_input_as_handled()

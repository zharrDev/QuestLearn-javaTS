class_name GameHud
extends Control

signal start_pressed
signal pause_pressed
signal mute_pressed
signal resume_pressed
signal restart_pressed

const W := 640.0
const H := 360.0

var world_native := "English"
var max_hp := 5

var stats_panel: PanelContainer
var timer_panel: PanelContainer
var score_value: Label
var combo_value: Label
var wpm_value: Label
var acc_value: Label
var hearts: Hearts
var timer_label: Label
var timer_bar: ProgressBar
var timer_sub: Label
var target_panel: PanelContainer
var target_text: RichTextLabel
var target_bar: ProgressBar
var world_label: Label
var level_chip_label: Label
var mute_button: Button
var pause_button: Button
var countdown_label: Label

var ready_layer: Control
var ready_meta: Label
var ready_body: Label
var start_button: Button
var pause_layer: Control
var over_layer: Control
var over_title: Label
var over_stats: Label
var over_note: Label
var muted := false

class Hearts extends Control:
	var hp := 5
	var total := 5
	var fill_color := Color("#F2645A")
	const PATTERN := ["01100110", "11111111", "11111111", "01111110", "00111100", "00011000"]

	func _ready() -> void:
		custom_minimum_size = Vector2(96, 14)
		mouse_filter = Control.MOUSE_FILTER_IGNORE

	func set_hearts(value: int, maximum: int) -> void:
		hp = value
		total = maximum
		queue_redraw()

	func _draw() -> void:
		for h in total:
			var ox := h * 18.0
			var filled := h < hp
			for row in PATTERN.size():
				var line: String = PATTERN[row]
				for col in line.length():
					if line[col] == "1":
						var c := fill_color if filled else Color(1, 1, 1, 0.16)
						draw_rect(Rect2(ox + col * 2, row * 2, 2, 2), c)
			if filled:
				draw_rect(Rect2(ox + 2, 2, 2, 2), fill_color.lightened(0.45))

func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	theme = UiKit.theme()
	add_child(UiKit.vignette(0.3))
	add_child(UiKit.scanlines())
	_build_hud()
	_build_ready()
	_build_pause()
	_build_over()

func _build_hud() -> void:
	var stats := UiKit.panel(Color("#0B141B"), Color("#33424E"))
	stats.position = Vector2(12, 10)
	stats.size = Vector2(192, 124)
	stats_panel = stats
	add_child(stats)
	var sv := VBoxContainer.new()
	sv.add_theme_constant_override("separation", 3)
	stats.add_child(sv)
	var head := HBoxContainer.new()
	head.add_theme_constant_override("separation", 6)
	sv.add_child(head)
	world_label = UiKit.label(world_native.to_upper(), 7, UiKit.ACCENT_SOFT)
	world_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	head.add_child(world_label)
	var level_chip := UiKit.chip(Loc.t("easy"), UiKit.GREEN_LIGHT, 6)
	level_chip_label = level_chip.get_child(0) as Label
	head.add_child(level_chip)

	var grid := GridContainer.new()
	grid.columns = 2
	grid.add_theme_constant_override("h_separation", 8)
	grid.add_theme_constant_override("v_separation", 2)
	sv.add_child(grid)
	score_value = _stat_cell(grid, Loc.t("score"), "0", UiKit.ACCENT)
	combo_value = _stat_cell(grid, Loc.t("combo"), "-", UiKit.ACCENT_SOFT)
	wpm_value = _stat_cell(grid, Loc.t("wpm"), "0", UiKit.GREEN_LIGHT)
	acc_value = _stat_cell(grid, Loc.t("accuracy"), "100%", UiKit.BLUE)

	var lives_row := HBoxContainer.new()
	lives_row.add_theme_constant_override("separation", 6)
	sv.add_child(lives_row)
	lives_row.add_child(UiKit.label(Loc.t("lives"), 7, Color("#F08A82")))
	hearts = Hearts.new()
	hearts.hp = max_hp
	hearts.total = max_hp
	hearts.fill_color = UiKit.BLUE if bool(Profile.settings.get("colorblind", false)) else Color("#F2645A")
	lives_row.add_child(hearts)

	var timer := UiKit.panel(Color("#0B141B"), Color("#33424E"))
	timer.position = Vector2(W / 2.0 - 63, 10)
	timer.size = Vector2(126, 68)
	timer_panel = timer
	add_child(timer)
	var tv := VBoxContainer.new()
	tv.add_theme_constant_override("separation", 2)
	timer.add_child(tv)
	timer_label = UiKit.display("01:00", 15, UiKit.ACCENT)
	timer_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	tv.add_child(timer_label)
	timer_bar = ProgressBar.new()
	timer_bar.show_percentage = false
	timer_bar.custom_minimum_size = Vector2(0, 5)
	timer_bar.max_value = 1
	timer_bar.value = 1
	timer_bar.add_theme_stylebox_override("background", UiKit.box(Color("#060C12"), Color("#33424E"), 1, 0, 0))
	timer_bar.add_theme_stylebox_override("fill", UiKit.box(UiKit.GREEN_LIGHT, UiKit.GREEN_LIGHT, 0, 0, 0))
	tv.add_child(timer_bar)
	timer_sub = UiKit.label("EASY · MISS 0", 6, UiKit.MUTED)
	timer_sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	tv.add_child(timer_sub)

	pause_button = UiKit.button("II", 8)
	pause_button.position = Vector2(W - 12 - 34, 10)
	pause_button.size = Vector2(34, 32)
	pause_button.tooltip_text = Loc.t("pause") + " (Esc)"
	pause_button.pressed.connect(func() -> void: pause_pressed.emit())
	add_child(pause_button)

	mute_button = UiKit.button("SFX", 7)
	mute_button.position = Vector2(W - 12 - 34 - 6 - 40, 10)
	mute_button.size = Vector2(40, 32)
	mute_button.tooltip_text = Loc.t("sound")
	mute_button.pressed.connect(func() -> void: mute_pressed.emit())
	add_child(mute_button)

	target_panel = UiKit.panel(Color("#0B141B"), Color("#46545F"))
	target_panel.position = Vector2(W / 2.0 - 210, H - 66)
	target_panel.size = Vector2(420, 58)
	target_panel.visible = false
	add_child(target_panel)
	var tg := VBoxContainer.new()
	tg.add_theme_constant_override("separation", 1)
	target_panel.add_child(tg)
	var tl := UiKit.label(Loc.t("target"), 6, UiKit.ACCENT_SOFT)
	tl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	tg.add_child(tl)
	target_text = RichTextLabel.new()
	target_text.bbcode_enabled = true
	target_text.scroll_active = false
	target_text.fit_content = false
	target_text.custom_minimum_size = Vector2(0, 30)
	target_text.add_theme_font_override("normal_font", UiKit.font_body())
	target_text.add_theme_font_size_override("normal_font_size", 26)
	target_text.add_theme_color_override("default_color", UiKit.INK)
	target_text.mouse_filter = Control.MOUSE_FILTER_IGNORE
	tg.add_child(target_text)
	target_bar = ProgressBar.new()
	target_bar.show_percentage = false
	target_bar.custom_minimum_size = Vector2(0, 3)
	target_bar.max_value = 1
	target_bar.add_theme_stylebox_override("background", UiKit.box(Color("#060C12"), Color("#33424E"), 1, 0, 0))
	target_bar.add_theme_stylebox_override("fill", UiKit.box(UiKit.BLUE, UiKit.BLUE, 0, 0, 0))
	tg.add_child(target_bar)

	countdown_label = UiKit.display("3", 56, UiKit.ACCENT)
	countdown_label.position = Vector2(0, 94)
	countdown_label.size = Vector2(W, 90)
	countdown_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	countdown_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	countdown_label.visible = false
	add_child(countdown_label)

func _stat_cell(parent: Control, title: String, value: String, color: Color) -> Label:
	var cell := VBoxContainer.new()
	cell.custom_minimum_size = Vector2(78, 0)
	cell.add_theme_constant_override("separation", 0)
	parent.add_child(cell)
	cell.add_child(UiKit.label(title, 6, color))
	var v := UiKit.display(value, 12, UiKit.INK)
	v.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	cell.add_child(v)
	return v

func _dim_layer() -> Control:
	var layer := Control.new()
	layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	layer.mouse_filter = Control.MOUSE_FILTER_STOP
	var shade := ColorRect.new()
	shade.color = Color(0.015, 0.03, 0.045, 0.7)
	shade.set_anchors_preset(Control.PRESET_FULL_RECT)
	shade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(shade)
	add_child(layer)
	return layer

func _center_panel(layer: Control, width: float, height: float, title: String) -> VBoxContainer:
	var panel := UiKit.panel(Color("#0B141B"), Color("#46545F"))
	panel.position = Vector2((W - width) / 2.0, (H - height) / 2.0)
	panel.size = Vector2(width, height)
	layer.add_child(panel)
	var box := VBoxContainer.new()
	box.add_theme_constant_override("separation", 5)
	panel.add_child(box)
	var t := UiKit.display(title, 13, UiKit.ACCENT)
	t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(t)
	return box

func _build_ready() -> void:
	ready_layer = _dim_layer()
	var box := _center_panel(ready_layer, 440, 248, Loc.t("ready_title"))
	ready_meta = UiKit.label("", 7, UiKit.ACCENT_SOFT)
	ready_meta.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(ready_meta)
	ready_body = UiKit.label(Loc.t("ready_body"), 8, UiKit.INK)
	ready_body.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	ready_body.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	ready_body.custom_minimum_size = Vector2(400, 30)
	box.add_child(ready_body)
	var how := UiKit.panel(Color("#0A1119"), Color("#33414D"))
	box.add_child(how)
	var hv := VBoxContainer.new()
	hv.add_theme_constant_override("separation", 1)
	how.add_child(hv)
	for i in 3:
		var row := HBoxContainer.new()
		row.add_theme_constant_override("separation", 6)
		hv.add_child(row)
		row.add_child(UiKit.keycap(str(i + 1), UiKit.GREEN_LIGHT))
		var line := UiKit.label(Loc.t("tutorial_%d" % (i + 1)), 7, UiKit.INK_SOFT)
		line.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		line.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		row.add_child(line)
	start_button = UiKit.primary(Loc.t("start_run"), 9)
	start_button.custom_minimum_size = Vector2(0, 36)
	start_button.pressed.connect(func() -> void: start_pressed.emit())
	box.add_child(start_button)
	var foot := UiKit.label(Loc.t("press_enter"), 6, UiKit.MUTED)
	foot.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(foot)
	ready_layer.visible = false

func _build_pause() -> void:
	pause_layer = _dim_layer()
	var box := _center_panel(pause_layer, 300, 152, Loc.t("paused"))
	var body := UiKit.label(Loc.t("paused_body"), 7, UiKit.MUTED)
	body.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(body)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	box.add_child(row)
	var resume := UiKit.primary(Loc.t("resume"), 8)
	resume.custom_minimum_size = Vector2(120, 32)
	resume.pressed.connect(func() -> void: resume_pressed.emit())
	row.add_child(resume)
	var restart := UiKit.button(Loc.t("restart"), 8)
	restart.custom_minimum_size = Vector2(120, 32)
	restart.pressed.connect(func() -> void: restart_pressed.emit())
	row.add_child(restart)
	var foot := UiKit.label(Loc.t("resume_key"), 6, UiKit.MUTED)
	foot.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(foot)
	pause_layer.visible = false

func _build_over() -> void:
	over_layer = _dim_layer()
	var box := _center_panel(over_layer, 320, 126, Loc.t("times_up"))
	over_title = box.get_child(0) as Label
	over_stats = UiKit.label("", 8, UiKit.INK_SOFT)
	over_stats.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(over_stats)
	over_note = UiKit.label(Loc.t("saving_run"), 7, UiKit.MUTED)
	over_note.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(over_note)
	over_layer.visible = false

func setup(world_info: Dictionary, level: String, duration: float, hearts_count: int) -> void:
	world_native = str(world_info.get("native", "English"))
	max_hp = hearts_count
	if world_label != null:
		world_label.text = world_native.to_upper()
	if level_chip_label != null:
		level_chip_label.text = Loc.t(level.to_lower())
	if hearts != null:
		hearts.set_hearts(max_hp, max_hp)
	if ready_meta != null:
		ready_meta.text = "%s · %s · %s" % [world_native, Loc.t(level.to_lower()), _duration_text(duration)]
	if timer_label != null:
		timer_label.text = "%02d:%02d" % [int(duration) / 60, int(duration) % 60]
	if timer_sub != null:
		timer_sub.text = "%s · %s 0" % [Loc.t(level.to_lower()), Loc.t("miss")]
	theme = UiKit.theme()

func _duration_text(seconds: float) -> String:
	if seconds < 60.0:
		return Loc.tf("sec", [int(seconds)])
	return Loc.tf("min", [int(seconds / 60.0)])

func set_muted(value: bool) -> void:
	muted = value
	if mute_button != null:
		mute_button.text = Loc.t("muted") if muted else "SFX"
		mute_button.add_theme_color_override("font_color", UiKit.RED if muted else UiKit.INK)

func show_phase(phase: String) -> void:
	var playing := phase != "ready"
	stats_panel.visible = playing
	timer_panel.visible = playing
	mute_button.visible = playing
	pause_button.visible = playing
	ready_layer.visible = phase == "ready"
	pause_layer.visible = phase == "paused"
	over_layer.visible = phase == "over"
	countdown_label.visible = phase == "countdown"
	target_panel.visible = phase == "playing"
	pause_button.disabled = phase == "over"
	mute_button.disabled = false

func update_state(state: Dictionary) -> void:
	score_value.text = str(state.get("score", 0))
	var combo := int(state.get("combo", 0))
	combo_value.text = "x%d" % combo if combo > 0 else "-"
	combo_value.add_theme_color_override("font_color", UiKit.ACCENT if combo >= 10 else UiKit.INK)
	wpm_value.text = str(state.get("wpm", 0))
	acc_value.text = "%d%%" % int(state.get("acc", 100))
	hearts.set_hearts(int(state.get("hp", max_hp)), max_hp)
	timer_sub.text = "%s · %s %d" % [Loc.t(str(state.get("level", "EASY")).to_lower()), Loc.t("miss"), int(state.get("missed", 0))]
	var left := float(state.get("time_left", 0))
	timer_label.text = "%02d:%02d" % [int(left) / 60, int(left) % 60]
	var ratio := float(state.get("time_ratio", 1.0))
	timer_bar.value = ratio
	var fill := UiKit.BLUE if bool(Profile.settings.get("colorblind", false)) else UiKit.GREEN_LIGHT
	if ratio <= 0.2:
		fill = UiKit.RED
	elif ratio <= 0.55:
		fill = UiKit.ACCENT
	timer_bar.add_theme_stylebox_override("fill", UiKit.box(fill, fill, 0, 0, 0))
	if state.has("countdown"):
		countdown_label.text = str(state["countdown"])
	if state.has("target_bbcode"):
		target_text.text = str(state["target_bbcode"])
		target_bar.value = float(state.get("target_ratio", 0.0))

func show_over(reason: String, stats: Dictionary) -> void:
	over_title.text = Loc.t("out_of_hearts") if reason == "hp" else Loc.t("times_up")
	over_title.add_theme_color_override("font_color", UiKit.RED if reason == "hp" else UiKit.ACCENT)
	over_stats.text = "%s %s · %s %s" % [Loc.t("score"), str(stats.get("score", 0)), Loc.t("wpm"), str(stats.get("wpm", 0))]
	over_note.text = Loc.t("saving_run")

func set_over_note(text: String) -> void:
	if over_note != null:
		over_note.text = text

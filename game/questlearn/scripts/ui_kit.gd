class_name UiKit
## Shared visual language for every screen.
##
## Display type is Press Start 2P (titles, timer, rank). Body type is VT323,
## which is dramatically easier to read at 640x360 while keeping the pixel feel.
## Panels are flat, squared and outlined; no rounded corners, no gradients.

const INK := Color("#F5EFDF")
const INK_SOFT := Color("#D8D2C4")
const MUTED := Color("#8E9BA8")
const PANEL_BG := Color("#101A24")
const PANEL_DEEP := Color("#0A1119")
const BORDER := Color("#46545F")
const BORDER_SOFT := Color("#2A3742")
const ACCENT := Color("#F2C14E")
const ACCENT_SOFT := Color("#FFE8A3")
const GREEN := Color("#2FA36B")
const PURPLE := Color("#C0A6F0")
const GREEN_LIGHT := Color("#8BE3AE")
const RED := Color("#F2645A")
const BLUE := Color("#79C8F2")
static var _theme: Theme
static var _font_display: FontFile
static var _font_body: FontFile

static func font_display() -> FontFile:
	if _font_display == null:
		_font_display = load("res://art/PressStart2P-Regular.ttf")
	return _font_display

static func font_body() -> FontFile:
	if _font_body == null:
		var body := load("res://art/fonts/VT323-Regular.ttf")
		_font_body = body if body != null else font_display()
	return _font_body

static func body_size(size: int) -> int:
	return clampi(int(round(float(size) * 1.9)), 13, 44)

static func theme() -> Theme:
	if _theme != null:
		return _theme
	var t := Theme.new()
	t.default_font = font_body()
	t.default_font_size = 18
	t.set_color("font_color", "Label", INK)
	t.set_color("font_outline_color", "Label", Color(0, 0, 0, 0.82))
	t.set_constant("outline_size", "Label", 1)
	t.set_constant("line_spacing", "Label", 2)

	t.set_stylebox("normal", "Button", box(PANEL_BG, BORDER, 2, 12, 5))
	t.set_stylebox("hover", "Button", box(Color("#223240"), Color("#71879A"), 2, 12, 5))
	t.set_stylebox("pressed", "Button", box(PANEL_DEEP, ACCENT, 2, 12, 5))
	t.set_stylebox("disabled", "Button", box(Color("#0D151D"), Color("#2A3444"), 2, 12, 5))
	t.set_stylebox("focus", "Button", StyleBoxEmpty.new())
	t.set_color("font_color", "Button", INK)
	t.set_color("font_hover_color", "Button", Color("#FFFFFF"))
	t.set_color("font_pressed_color", "Button", ACCENT_SOFT)
	t.set_color("font_disabled_color", "Button", Color("#5C6A78"))
	t.set_font_size("font_size", "Button", 18)

	t.set_stylebox("panel", "PanelContainer", box(PANEL_BG, BORDER, 2, 14, 10))
	t.set_stylebox("panel", "Panel", box(PANEL_BG, BORDER, 2, 14, 10))

	t.set_stylebox("normal", "LineEdit", box(PANEL_DEEP, BORDER, 2, 10, 5))
	t.set_stylebox("focus", "LineEdit", box(PANEL_DEEP, ACCENT, 2, 10, 5))
	t.set_color("font_color", "LineEdit", INK)
	t.set_color("caret_color", "LineEdit", ACCENT)
	t.set_color("font_placeholder_color", "LineEdit", Color("#5C6A78"))
	t.set_font_size("font_size", "LineEdit", 18)

	t.set_stylebox("background", "ProgressBar", box(PANEL_DEEP, BORDER_SOFT, 1, 0, 0))
	t.set_stylebox("fill", "ProgressBar", box(ACCENT, ACCENT, 0, 0, 0))

	t.set_stylebox("panel", "TooltipPanel", box(PANEL_DEEP, BORDER, 2, 8, 5))
	t.set_color("font_color", "TooltipLabel", INK)
	t.set_font_size("font_size", "TooltipLabel", 16)
	_theme = t
	return t

static func box(bg: Color, border: Color, width := 2, pad_h := 10, pad_v := 7) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = bg
	s.border_color = border
	s.set_border_width_all(width)
	s.content_margin_left = pad_h
	s.content_margin_right = pad_h
	s.content_margin_top = pad_v
	s.content_margin_bottom = pad_v
	s.corner_radius_top_left = 0
	s.corner_radius_top_right = 0
	s.corner_radius_bottom_left = 0
	s.corner_radius_bottom_right = 0
	return s

static func label(text: String, size := 9, color := INK) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_override("font", font_body())
	l.add_theme_font_size_override("font_size", body_size(size))
	l.add_theme_color_override("font_color", color)
	l.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.6))
	l.add_theme_constant_override("outline_size", 1)
	return l

static func display(text: String, size := 10, color := ACCENT) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_override("font", font_display())
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	l.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.9))
	l.add_theme_constant_override("outline_size", 3)
	return l

static func button(text: String, size := 9, variant := "default") -> Button:
	var b := Button.new()
	b.text = text
	b.add_theme_font_override("font", font_body())
	b.add_theme_font_size_override("font_size", body_size(size))
	b.focus_mode = Control.FOCUS_NONE
	b.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	if variant == "ghost":
		b.add_theme_stylebox_override("normal", box(Color(0, 0, 0, 0), Color("#33424E"), 2, 12, 5))
		b.add_theme_stylebox_override("hover", box(Color("#16222D"), Color("#6E8193"), 2, 12, 5))
		b.add_theme_color_override("font_color", INK_SOFT)
	elif variant == "danger":
		b.add_theme_stylebox_override("normal", box(Color("#2A1114"), Color("#8E3B3B"), 2, 12, 5))
		b.add_theme_stylebox_override("hover", box(Color("#3A181C"), Color("#D96A62"), 2, 12, 5))
		b.add_theme_color_override("font_color", Color("#FFC9C3"))
	return b

static func primary(text: String, size := 9) -> Button:
	var b := button(text, size)
	b.add_theme_stylebox_override("normal", box(GREEN, GREEN_LIGHT, 2, 14, 7))
	b.add_theme_stylebox_override("hover", box(Color("#3BB87B"), Color("#C8FFDF"), 2, 14, 7))
	b.add_theme_stylebox_override("pressed", box(Color("#248A59"), GREEN_LIGHT, 2, 14, 7))
	b.add_theme_color_override("font_color", Color("#06120C"))
	b.add_theme_color_override("font_hover_color", Color("#06120C"))
	b.add_theme_color_override("font_pressed_color", Color("#06120C"))
	b.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0))
	b.add_theme_constant_override("outline_size", 0)
	return b

static func slider_grabber(color := ACCENT) -> ImageTexture:
	var img := Image.create(10, 12, false, Image.FORMAT_RGBA8)
	img.fill(PANEL_DEEP)
	for y in range(2, 10):
		for x in range(2, 8):
			img.set_pixel(x, y, color)
	return ImageTexture.create_from_image(img)

static func chip(text: String, accent: Color, size := 7) -> PanelContainer:
	var p := panel(Color("#0E1A22"), accent.darkened(0.15))
	p.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	var l := label(text, size, accent)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	p.add_child(l)
	return p

static func panel(bg := PANEL_BG, border := BORDER) -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", box(bg, border))
	return p

static func spacer(height: int) -> Control:
	var c := Control.new()
	c.custom_minimum_size = Vector2(0, height)
	c.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return c

static func keycap(text: String, accent := ACCENT) -> PanelContainer:
	var p := panel(Color("#0B141B"), accent.darkened(0.25))
	p.add_theme_stylebox_override("panel", box(Color("#0B141B"), accent.darkened(0.25), 1, 6, 2))
	var l := label(text, 7, accent)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	p.add_child(l)
	return p

static func stat_row(key: String, value: String, value_color := INK) -> HBoxContainer:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	var k := label(key, 8, MUTED)
	k.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(k)
	var v := label(value, 9, value_color)
	v.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	row.add_child(v)
	return row

class Scanlines extends Control:
	func _draw() -> void:
		var c := Color(1, 1, 1, 0.025)
		var y := 0.0
		while y < size.y:
			draw_rect(Rect2(0, y, size.x, 1), c)
			y += 4.0

class Vignette extends Control:
	var strength := 0.55
	var tint := Color(0.01, 0.02, 0.035, 1.0)

	func _draw() -> void:
		var steps := 34
		for i in steps:
			var t := float(i) / float(steps)
			var inset := t * minf(size.x, size.y) * 0.46
			var alpha := strength * pow(t, 2.2) / float(steps) * 2.0
			var col := tint
			col.a = alpha
			draw_rect(Rect2(0, 0, size.x, inset), col)
			draw_rect(Rect2(0, size.y - inset, size.x, inset), col)
			draw_rect(Rect2(0, inset, inset, size.y - inset * 2.0), col)
			draw_rect(Rect2(size.x - inset, inset, inset, size.y - inset * 2.0), col)

static func vignette(strength := 0.55) -> Vignette:
	var v := Vignette.new()
	v.strength = strength
	v.set_anchors_preset(Control.PRESET_FULL_RECT)
	v.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return v

static func scanlines() -> Scanlines:
	var s := Scanlines.new()
	s.set_anchors_preset(Control.PRESET_FULL_RECT)
	s.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return s

static func fade_in(node: CanvasItem, duration := 0.35) -> void:
	if node == null:
		return
	node.modulate.a = 0.0
	var tween := node.create_tween()
	tween.tween_property(node, "modulate:a", 1.0, duration).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)



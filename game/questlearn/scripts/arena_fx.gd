extends Node2D
## Draws hit particles and floating score text above the crates.

var arena

func _draw() -> void:
	if arena == null:
		return
	if arena.hero != null and arena.action == "slash":
		var t := clampf(float(arena.action_t) / 0.36, 0.0, 1.0)
		var center: Vector2 = arena.hero.position + Vector2(12, -18)
		var radius := 26.0 + t * 18.0
		var alpha := (1.0 - t) * 0.62
		draw_arc(center, radius, -1.15, 1.15, 18, Color(1.0, 0.96, 0.72, alpha), 3.0)
		draw_arc(center, radius + 4.0, -0.95, 0.95, 16, Color(1.0, 0.78, 0.32, alpha * 0.5), 2.0)
	var font := UiKit.font_display()
	for p in arena.particles:
		var life := float(p["life"])
		var max_life := float(p["max_life"])
		var alpha := clampf(1.0 - life / max_life, 0.0, 1.0)
		var size := 2.0 + 2.0 * (1.0 - alpha)
		var color: Color = p["color"]
		color.a = alpha
		draw_rect(Rect2(p["pos"], Vector2(size, size)), color)
	for f in arena.floats:
		var life := float(f["life"])
		var alpha := clampf(1.0 - life / float(f["max_life"]), 0.0, 1.0)
		var color: Color = f["color"]
		color.a = alpha
		draw_string(
			font,
			f["pos"] - Vector2(40, 0),
			str(f["text"]),
			HORIZONTAL_ALIGNMENT_CENTER,
			80.0,
			9,
			color
		)

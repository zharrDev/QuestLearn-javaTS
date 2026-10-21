extends Node
## Local player profile, settings and offline run queue.
##
## The game must be fully playable at an expo without the Java backend, so all
## of the player-facing state lives here first and syncs to the API when it is
## available. Settings are applied on boot and persisted immediately.

const SETTINGS_PATH := "user://settings.cfg"
const PROFILE_PATH := "user://profile.json"
const PENDING_PATH := "user://pending_runs.json"

const DEFAULT_SETTINGS := {
	"master_volume": 85,
	"music_volume": 55,
	"sfx_volume": 80,
	"muted": false,
	"language": "id",
	"fullscreen": false,
	"screen_shake": true,
	"reduced_motion": false,
	"colorblind": false,
	"guest_name": "Pemain Baru",
	"last_world": "bahasa-indonesia",
	"last_level": "EASY",
	"last_duration": 60,
}

const DEFAULT_PROFILE := {
	"xp": 0,
	"streak": 1,
	"total_runs": 0,
	"best_wpm": 0,
	"best_combo": 0,
	"words_typed": 0,
	"words_missed": 0,
	"best_by_world": {},
	"history": [],
}

var settings: Dictionary = DEFAULT_SETTINGS.duplicate(true)
var profile: Dictionary = DEFAULT_PROFILE.duplicate(true)
var pending: Array = []

func _ready() -> void:
	load_all()
	apply_settings()

func load_all() -> void:
	var cfg := ConfigFile.new()
	if cfg.load(SETTINGS_PATH) == OK:
		for key in DEFAULT_SETTINGS:
			if cfg.has_section_key("settings", key):
				settings[key] = cfg.get_value("settings", key)
	profile = _merge(DEFAULT_PROFILE.duplicate(true), _read_json(PROFILE_PATH))
	var queued = _read_json_array(PENDING_PATH)
	pending = queued

func save_settings() -> void:
	var cfg := ConfigFile.new()
	for key in settings:
		cfg.set_value("settings", key, settings[key])
	cfg.save(SETTINGS_PATH)

func save_profile() -> void:
	_write_json(PROFILE_PATH, profile)

func save_pending() -> void:
	_write_json(PENDING_PATH, pending)

func apply_settings() -> void:
	var master := clampf(float(settings.get("master_volume", 85)) / 100.0, 0.0, 1.0)
	var music := clampf(float(settings.get("music_volume", 55)) / 100.0, 0.0, 1.0)
	var sfx := clampf(float(settings.get("sfx_volume", 80)) / 100.0, 0.0, 1.0)
	AudioServer.set_bus_volume_db(0, linear_to_db(maxf(master, 0.0001)))
	AudioServer.set_bus_mute(0, bool(settings.get("muted", false)))
	_set_bus_volume("Music", music)
	_set_bus_volume("SFX", sfx)
	Loc.set_locale(str(settings.get("language", "id")))
	_apply_fullscreen(bool(settings.get("fullscreen", false)))

func set_setting(key: String, value) -> void:
	settings[key] = value
	save_settings()
	apply_settings()

func toggle_setting(key: String) -> bool:
	var next := not bool(settings.get(key, false))
	set_setting(key, next)
	return next

func display_name() -> String:
	if Api.is_logged_in():
		return str(Api.user.get("nama", "Player"))
	return str(settings.get("guest_name", "Pemain Baru"))

func identity_label() -> String:
	if Api.is_logged_in():
		return "%s · %s" % [display_name(), str(Api.user.get("role", "SISWA"))]
	return "%s · %s" % [display_name(), Loc.t("guest")]

func best_wpm(slug := "") -> int:
	if slug == "":
		return int(profile.get("best_wpm", 0))
	var by_world: Dictionary = profile.get("best_by_world", {})
	return int(by_world.get(slug, 0))

func record_run(result: Dictionary) -> Dictionary:
	var score := int(result.get("skor", 0))
	var wpm := int(round(float(result.get("wpm", 0.0))))
	var combo := int(result.get("comboTerpanjang", 0))
	var kills := int(result.get("totalMusuhKalah", 0))
	var missed := int(result.get("totalMusuhLolos", 0))
	var slug := str(result.get("duniaSlug", ""))
	var new_best := wpm > best_wpm()
	profile["total_runs"] = int(profile.get("total_runs", 0)) + 1
	profile["words_typed"] = int(profile.get("words_typed", 0)) + kills
	profile["words_missed"] = int(profile.get("words_missed", 0)) + missed
	profile["best_wpm"] = maxi(int(profile.get("best_wpm", 0)), wpm)
	profile["best_combo"] = maxi(int(profile.get("best_combo", 0)), combo)
	if slug != "":
		var by_world: Dictionary = profile.get("best_by_world", {})
		by_world[slug] = maxi(int(by_world.get(slug, 0)), wpm)
		profile["best_by_world"] = by_world
	var history: Array = profile.get("history", [])
	history.push_front({
		"world": str(result.get("duniaNama", slug)),
		"slug": slug,
		"score": score,
		"wpm": wpm,
		"acc": float(result.get("akurasi", 0.0)),
		"combo": combo,
		"at": Time.get_datetime_string_from_system(),
	})
	while history.size() > 20:
		history.pop_back()
	profile["history"] = history
	save_profile()
	return {"new_best": new_best, "best_wpm": int(profile.get("best_wpm", 0))}

func add_xp(amount: int) -> void:
	profile["xp"] = int(profile.get("xp", 0)) + maxi(0, amount)
	save_profile()

func queue_run(result: Dictionary) -> void:
	pending.append(result)
	if pending.size() > 30:
		pending.pop_front()
	save_pending()

func take_pending() -> Array:
	var items := pending.duplicate(true)
	pending.clear()
	save_pending()
	return items

func reset_progress() -> void:
	profile = DEFAULT_PROFILE.duplicate(true)
	pending.clear()
	save_profile()
	save_pending()

func _set_bus_volume(bus_name: String, linear: float) -> void:
	var idx := AudioServer.get_bus_index(bus_name)
	if idx < 0:
		AudioServer.add_bus()
		idx = AudioServer.bus_count - 1
		AudioServer.set_bus_name(idx, bus_name)
		AudioServer.set_bus_send(idx, "Master")
	AudioServer.set_bus_volume_db(idx, linear_to_db(maxf(linear, 0.0001)))

func _apply_fullscreen(enabled: bool) -> void:
	if DisplayServer.get_name() == "headless":
		return
	var mode := DisplayServer.WINDOW_MODE_FULLSCREEN if enabled else DisplayServer.WINDOW_MODE_WINDOWED
	if DisplayServer.window_get_mode() != mode:
		DisplayServer.window_set_mode(mode)

func _read_json(path: String) -> Dictionary:
	if not FileAccess.file_exists(path):
		return {}
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return {}
	var parsed = JSON.parse_string(file.get_as_text())
	return parsed if typeof(parsed) == TYPE_DICTIONARY else {}

func _read_json_array(path: String) -> Array:
	if not FileAccess.file_exists(path):
		return []
	var file := FileAccess.open(path, FileAccess.READ)
	if file == null:
		return []
	var parsed = JSON.parse_string(file.get_as_text())
	return parsed if typeof(parsed) == TYPE_ARRAY else []

func _write_json(path: String, value) -> void:
	var file := FileAccess.open(path, FileAccess.WRITE)
	if file == null:
		return
	file.store_string(JSON.stringify(value, "\t"))

func _merge(base: Dictionary, incoming: Dictionary) -> Dictionary:
	for key in incoming:
		if base.has(key) and typeof(base[key]) == TYPE_DICTIONARY and typeof(incoming[key]) == TYPE_DICTIONARY:
			base[key] = _merge(base[key].duplicate(true), incoming[key])
		else:
			base[key] = incoming[key]
	return base

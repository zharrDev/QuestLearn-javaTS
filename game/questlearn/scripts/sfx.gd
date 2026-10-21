class_name Sfx
extends Node
## Procedural chip sounds: every effect is generated into an AudioStreamWAV at
## runtime, so the build ships without audio files.

const RATE := 22050

var muted := false
var _players: Array[AudioStreamPlayer] = []

func _ready() -> void:
	muted = bool(Profile.settings.get("muted", false))
	for i in 6:
		var p := AudioStreamPlayer.new()
		p.bus = "SFX" if AudioServer.get_bus_index("SFX") >= 0 else "Master"
		add_child(p)
		_players.append(p)

func set_muted(value: bool) -> void:
	muted = value
	Profile.set_setting("muted", value)

func toggle() -> bool:
	set_muted(not muted)
	if not muted:
		ui()
	return muted

func _wav(freq: float, dur: float, kind := "square", vol := 0.22, end_freq := -1.0) -> AudioStreamWAV:
	var count := int(RATE * dur)
	var data := PackedByteArray()
	data.resize(count * 2)
	var phase := 0.0
	for i in count:
		var t := float(i) / RATE
		var f := freq
		if end_freq > 0.0:
			f = lerp(freq, end_freq, float(i) / count)
		phase += TAU * f / RATE
		var v := 0.0
		match kind:
			"square":
				v = 1.0 if sin(phase) >= 0.0 else -1.0
			"triangle":
				v = 2.0 / PI * asin(sin(phase))
			"saw":
				v = fmod(phase / TAU, 1.0) * 2.0 - 1.0
			_:
				v = sin(phase)
		var env := pow(1.0 - float(i) / count, 2.0)
		var sample := int(clampf(v * env * vol, -1.0, 1.0) * 32767.0)
		data.encode_s16(i * 2, sample)
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = RATE
	stream.stereo = false
	stream.data = data
	return stream

func _play(stream: AudioStreamWAV) -> void:
	if muted:
		return
	for p in _players:
		if not p.playing:
			p.stream = stream
			p.play()
			return

func slash(step := 0) -> void:
	_play(_wav(520.0 + step * 26.0, 0.07, "triangle", 0.18, 300.0))

func kill() -> void:
	_play(_wav(660.0, 0.09, "square", 0.16))
	_play(_wav(990.0, 0.12, "square", 0.12))

func error() -> void:
	_play(_wav(180.0, 0.11, "saw", 0.2, 110.0))

func miss() -> void:
	_play(_wav(220.0, 0.26, "saw", 0.24, 80.0))

func countdown(final := false) -> void:
	_play(_wav(880.0 if final else 440.0, 0.14, "square", 0.16))

func ui() -> void:
	_play(_wav(620.0, 0.05, "square", 0.1))
